import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  IssuerUser,
  IssuerUserDocument,
} from "../../authIssuer/schemas/issuer-user.schema";
import {
  assetApproval,
  AssetApprovalDocument,
} from "../schema/asset.approval.model";
import { Asset, AssetDocument } from "../schema/asset.model";
import { SendAssetApprovalDto } from "./dto/send-asset-approval.dto";
import { Admin, AdminDocument } from "../../admin/schemas/admin.schema";
import { EmailService } from "@/infra/email/email.service";

@Injectable()
export class AssetApprovalService {
  private readonly logger = new Logger(AssetApprovalService.name);

  constructor(
    @InjectModel(assetApproval.name)
    private readonly assetApproval: Model<AssetApprovalDocument>,

    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,

    @InjectModel(IssuerUser.name)
    private readonly issuerModel: Model<IssuerUserDocument>,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,

    private readonly emailService: EmailService,
  ) {}

  async sendAssetApproval(
    issuerId: string,
    assetId: string,
    dto: SendAssetApprovalDto,
  ) {
    const assetObjectId = new Types.ObjectId(assetId);
    const issuerObjectId = new Types.ObjectId(issuerId);

    // Fetch Asset name
    const asset = await this.assetModel
      .findById(assetObjectId)
      .select("name")
      .lean();

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    if (!asset.name) {
      throw new NotFoundException("Asset name not found");
    }

    const issuer = await this.issuerModel
      .findById(issuerObjectId)
      .select("firstName lastName email")
      .lean();

    if (!issuer) {
      throw new NotFoundException("Issuer not found");
    }

    if (!issuer.email) {
      throw new NotFoundException("Issuer email not found");
    }

    const issuerName =
      `${issuer.firstName ?? ""} ${issuer.lastName ?? ""}`.trim();

    // Prevent duplicate status row per Asset
    const existing = await this.assetApproval.findOne({
      assetId: assetObjectId,
    });

    if (existing) {
      throw new ConflictException("Asset approval already exists");
    }

    // Create status entry
    const assetApproval = await this.assetApproval.create({
      issuerId,
      assetId: assetObjectId,
      issuername: issuerName,
      issueremail: issuer.email,
      assetName: asset.name,
      status: dto.status,
      issuerComments: dto.issuerComments,
    });

    await this.assetModel.updateOne(
      { _id: assetObjectId },
      { $set: { status: dto.status } },
    );

    // Send email notification to all active admins
    await this.sendAdminNotification(
      issuerName,
      issuer.email,
      asset.name,
      dto.status,
      dto.issuerComments,
    );

    return assetApproval;
  }

  /**
   * Send email notification to all active admins about asset approval request
   */
  private async sendAdminNotification(
    issuerName: string,
    issuerEmail: string,
    assetName: string,
    status: string,
    issuerComments?: string,
  ): Promise<void> {
    try {
      // Fetch all active admins
      const admins = await this.adminModel
        .find({ isActive: true })
        .select("email firstName")
        .lean();

      if (!admins || admins.length === 0) {
        this.logger.warn(
          "No active admins found to send asset approval notification",
        );
        return;
      }

      // Send email to each admin
      const emailPromises = admins.map(async (admin) => {
        try {
          await this.emailService.sendEmail(
            admin.email,
            `New Asset Approval Request - ${assetName}`,
            "asset-approval-request",
            {
              issuerName,
              issuerEmail,
              assetName,
              status,
              issuerComments: issuerComments || "No comments provided",
            },
          );
          this.logger.log(
            `Asset approval notification sent to admin: ${admin.email}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send asset approval notification to admin ${admin.email}:`,
            error,
          );
        }
      });

      await Promise.allSettled(emailPromises);
    } catch (error) {
      this.logger.error("Error sending admin notifications:", error);
      // Don't throw error - we don't want to fail the asset creation if email fails
    }
  }
}
