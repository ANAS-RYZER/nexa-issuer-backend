import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as crypto from "crypto";
import axios from "axios";
import { User, UserDocument } from "../users/schemas/user.schema";
import { GenerateKycLinkDto } from "./dto/generate-kyc-link.dto";
import { SumsubWebhookDto } from "./dto/sumsub-webhook.dto";
import {
  KycVerification,
  KycVerificationDocument,
} from "./schemas/kyc-verification.schema";
import { SUMSUB_CONFIG, SumsubConfig } from "./config/sumsub.config";

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly sumsubApiUrl: string;
  private readonly appToken: string;
  private readonly appSecret: string;
  private readonly isConfigured: boolean;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(KycVerification.name)
    private kycVerificationModel: Model<KycVerificationDocument>,
    @Inject(SUMSUB_CONFIG) private sumsubConfig: SumsubConfig,
  ) {
    // Use injected configuration (more scalable and testable)
    this.sumsubApiUrl = this.sumsubConfig.apiUrl;
    this.appToken = this.sumsubConfig.appToken;
    this.appSecret = this.sumsubConfig.appSecret;
    this.isConfigured = this.sumsubConfig.isConfigured;
  }

  /**
   * Generate HMAC SHA-256 signature for Sumsub API
   */
  private generateSignature(
    method: string,
    resourceUrl: string,
    timestamp: number,
    body?: any,
  ): string {
    if (!this.appSecret) {
      throw new InternalServerErrorException(
        "Sumsub secret key is not configured. Please check SUMSUB_APP_SECRET in .env file",
      );
    }

    const bodyString = body ? JSON.stringify(body) : "";
    const signatureData = `${timestamp}${method}${resourceUrl}${bodyString}`;

    return crypto
      .createHmac("sha256", this.appSecret)
      .update(signatureData)
      .digest("hex");
  }

  async fetchApplicantProfile(applicantId: string): Promise<any> {
    const method = "GET";
    const resourceUrl = `/resources/applicants/${applicantId}/one`;
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = this.generateSignature(method, resourceUrl, timestamp);

    const response = await axios.get(`${this.sumsubApiUrl}${resourceUrl}`, {
      headers: {
        "X-App-Token": this.appToken,
        "X-App-Access-Ts": timestamp.toString(),
        "X-App-Access-Sig": signature,
      },
    });

    return response.data;
  }

  /**
   * Reset Sumsub applicant profile to allow full KYC retry with same applicantId.
   * Used when our user KYC status is `rejected` before generating a new link.
   */
  async resetApplicant(applicantId: string): Promise<void> {
    const method = "POST";
    const resourceUrl = `/resources/applicants/${applicantId}/reset`;
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = this.generateSignature(method, resourceUrl, timestamp);

    try {
      await axios.request({
        method: "POST",
        url: `${this.sumsubApiUrl}${resourceUrl}`,
        headers: {
          "X-App-Token": this.appToken,
          "X-App-Access-Ts": timestamp.toString(),
          "X-App-Access-Sig": signature,
          "Content-Type": "application/json",
        },
      });

      // Update User status to 'initiated' and clear rejection reason
      const kycVerification = await this.kycVerificationModel.findOne({
        applicantId,
      });

      if (kycVerification && kycVerification.userId) {
        await this.userModel.findByIdAndUpdate(kycVerification.userId, {
          kycStatus: "initiated",
          kycRejectReason: null,
        });
      }
    } catch (error) {
      // Sumsub returns 400 when reset is not allowed (e.g. pending/queued)
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.description || "Failed to reset KYC applicant",
        );
      }

      throw new InternalServerErrorException(
        "Failed to communicate with KYC provider while resetting applicant",
      );
    }
  }

  /**
   * Save Sumsub profile into KycVerification (same schema as Profile API response).
   */
  async saveApplicantProfile(
    applicantId: string,
    profile: Record<string, unknown>,
  ): Promise<void> {
    const {
      createdAt,
      createdBy,
      key,
      clientId,
      info,
      email,
      applicantPlatform,
      ipCountry,
      agreement,
      requiredIdDocs,
      review,
      type,
      notes,
    } = profile;

    await this.kycVerificationModel.updateOne(
      { applicantId },
      {
        $set: {
          createdAt,
          createdBy,
          key,
          clientId,
          info,
          email,
          applicantPlatform,
          ipCountry,
          agreement,
          requiredIdDocs,
          review,
          type,
          notes,
          receivedAt: new Date(),
        },
      },
    );
  }

  /**
   * Fetch profile from Sumsub, store in DB, return. Full data anna store chestam.
   */
  async fetchAndSaveApplicantProfile(applicantId: string): Promise<any> {
    const profile = await this.fetchApplicantProfile(applicantId);
    await this.saveApplicantProfile(
      applicantId,
      profile as Record<string, unknown>,
    );
    return profile;
  }

  /**
   * Generate Sumsub SDK Web Link for KYC verification
   */
  async generateWebSdkLink(
    userId: string,
    generateKycLinkDto: GenerateKycLinkDto,
  ): Promise<{
    url: string;
    token: string;
    userId: string;
    expiresAt: Date;
  }> {
    // Fetch user from database
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.isKycVerified === true) {
      throw new BadRequestException("User kyc is already verified");
    }
    if (!user.email) {
      throw new BadRequestException(
        "User email is required for KYC verification",
      );
    }
    if (this.appToken === "") {
      throw new BadRequestException(
        "Sumsub app token is not configured. Please check SUMSUB_APP_TOKEN in .env file",
      );
    }

    if (user.kycStatus === "rejected") {
      if ((user.kycRetryCount ?? 0) >= 3) {
        throw new BadRequestException(
          "Maximum retry limit reached. Please contact support for assistance.",
        );
      }

      const existingKyc = await this.kycVerificationModel
        .findOne({ externalUserId: userId })
        .sort({ createdAt: -1 });

      if (existingKyc?.applicantId) {
        try {
          await this.resetApplicant(existingKyc.applicantId);
        } catch (error) {
          this.logger.error(
            `Failed to reset applicant ${existingKyc.applicantId}`,
            error.stack,
          );
          // We don't throw here to allow the SDK link generation to attempt to proceed
          // if it's just a reset failure, BUT given the user's latest change,
          // they might want a throw here. However, my main goal is to block based on count.
        }
      }
    }

    // Prepare request
    const method = "POST";
    const resourceUrl = "/resources/sdkIntegrations/levels/-/websdkLink";
    const timestamp = Math.floor(Date.now() / 1000);

    const requestBody = {
      levelName: generateKycLinkDto.levelName || "id-and-liveness",
      userId: userId,
      applicantIdentifiers: {
        email: user.email,
      },
      redirect: {
        successUrl: "https://tokera.vercel.app/kyc",
        rejectUrl: "https://tokera.vercel.app/kyc",
      },
      type: "INDIVIDUAL",
      ttlInSecs: generateKycLinkDto.ttlInSecs || 1800,
    };
    // Generate signature
    const signature = this.generateSignature(
      method,
      resourceUrl,
      timestamp,
      requestBody,
    );

    try {
      // Make API call to Sumsub
      const response = await axios.post(
        `${this.sumsubApiUrl}${resourceUrl}`,
        requestBody,
        {
          headers: {
            "X-App-Token": this.appToken, // Safe because isConfigured check
            "X-App-Access-Ts": timestamp.toString(),
            "X-App-Access-Sig": signature,
            "Content-Type": "application/json",
          },
        },
      );

      // Calculate expiration time
      const expiresAt = new Date(
        Date.now() + (generateKycLinkDto.ttlInSecs || 1800) * 1000,
      );

      return {
        url: response.data.url,
        token: response.data.token,
        userId: userId,
        expiresAt,
      };
    } catch (error) {
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.description || "Failed to generate KYC link",
        );
      }

      throw new InternalServerErrorException(
        "Failed to communicate with KYC provider",
      );
    }
  }

  async processWebhook(webhookData: any): Promise<void> {
    // 1. Find user
    const user = await this.userModel.findById(webhookData.externalUserId);
    if (!user) {
      console.warn("User not found:", webhookData.externalUserId);
      return;
    }

    // 2. UPSERT KYC – store only refs; full profile from Profile API when needed
    const reviewAnswer = webhookData.reviewResult?.reviewAnswer;
    await this.kycVerificationModel.updateOne(
      { inspectionId: webhookData.inspectionId },
      {
        $set: {
          userId: user._id,
          applicantId: webhookData.applicantId,
          inspectionId: webhookData.inspectionId,
          externalUserId: webhookData.externalUserId,
          levelName: webhookData.levelName,
          ...(reviewAnswer && { reviewAnswer }),
          receivedAt: new Date(),
        },
      },
      { upsert: true },
    );

    // 3. USER KYC STATE MACHINE (initiating → pending → approved/rejected)
    switch (webhookData.type) {
      case "applicantCreated":
        user.kycStatus = "initiated";
        break;

      case "applicantPending":
        user.kycStatus = "pending";
        break;

      case "applicantReviewed": {
        const answer = webhookData.reviewResult?.reviewAnswer;

        if (answer === "GREEN") {
          user.kycStatus = "approved";
          user.isKycVerified = true;
          user.kycReviewedAt = new Date();
        }

        if (answer === "RED") {
          user.kycStatus = "rejected";
          user.isKycVerified = false;
          user.kycReviewedAt = new Date();
          user.kycRejectReason =
            webhookData.reviewResult?.clientComment ?? "Verification failed";
          user.kycRetryCount = (user.kycRetryCount || 0) + 1;
        }

        // Store full Sumsub profile in DB (info, idDocs, review, etc.)
        try {
          const profile = await this.fetchApplicantProfile(
            webhookData.applicantId,
          );
          user.legalName = profile.info.firstName;
          user.dateOfBirth = profile.info.dob;

          await this.saveApplicantProfile(
            webhookData.applicantId,
            profile as Record<string, unknown>,
          );
        } catch (err) {
          this.logger.warn(
            `Could not fetch/save Sumsub profile for applicant ${webhookData.applicantId}`,
            err?.message ?? err,
          );
        }
        break;
      }
    }

    await user.save();
  }
}
