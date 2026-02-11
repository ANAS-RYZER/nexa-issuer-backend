import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  Req,
  Param,
} from "@nestjs/common";
import { Request } from "express";
import { KycService } from "./kyc.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { GenerateKycLinkDto } from "./dto/generate-kyc-link.dto";
import { SumsubWebhookDto } from "./dto/sumsub-webhook.dto";
import { ConfigService } from "@nestjs/config";
@Controller("kyc")
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Debug endpoint to check if Sumsub credentials are loaded
   * GET /kyc/check-config
   * No authentication required for debugging
   */
  @Get("check-config")
  @HttpCode(HttpStatus.OK)
  checkConfig() {
    const appToken = this.configService.get<string>("SUMSUB_APP_TOKEN");
    const appSecret = this.configService.get<string>("SUMSUB_APP_SECRET");

    return {
      statusCode: HttpStatus.OK,
      message: "Environment configuration check",
      data: {
        SUMSUB_APP_TOKEN: appToken
          ? `✅ Loaded (${appToken.substring(0, 10)}...)`
          : "❌ Missing",
        SUMSUB_APP_SECRET: appSecret
          ? `✅ Loaded (${appSecret.substring(0, 6)}...)`
          : "❌ Missing",
        isConfigured: !!(appToken && appSecret),
        nodeEnv: process.env.NODE_ENV || "not set",
        sumsubEnvKeys: Object.keys(process.env).filter((key) =>
          key.startsWith("SUMSUB"),
        ),
      },
    };
  }

  /**
   * Generate Sumsub KYC Web SDK Link
   * POST /kyc/generate-link
   *
   * Requires: Authorization header with Bearer token
   * Returns: KYC verification URL and token
   */
  @Post("generate-link")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateKycLink(
    @CurrentUser() user: any,
    @Body() generateKycLinkDto: GenerateKycLinkDto,
  ) {
    const result = await this.kycService.generateWebSdkLink(
      user.userId,
      generateKycLinkDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: "KYC verification link generated successfully",
      data: result,
    };
  }

  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(@Body() webhookData: any, @Req() req: Request) {
    console.log("RAW BODY:", req.body);

    // Call service (do not block webhook)
    this.kycService.processWebhook(req.body).catch((err) => {
      console.error("Webhook processing error:", err);
    });

    return { status: "ok" };
  }

  @Get("sumsub-profile/:applicantId")
  @HttpCode(HttpStatus.OK)
  async getSumsubProfile(@Param("applicantId") applicantId: string) {
    const result =
      await this.kycService.fetchAndSaveApplicantProfile(applicantId);
    return {
      statusCode: HttpStatus.OK,
      message: "Sumsub profile fetched successfully",
      data: result,
    };
  }
  //   @Post('webhook')
  // async handleWebhook(
  //   @Body() webhookData: any,
  //   @Req() req: Request,
  // ) {
  //   console.log('RAW BODY:', req.body);

  //   return { status: 'ok' };
  // }

  @Post("reset/:applicantId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetApplicant(@Param("applicantId") applicantId: string) {
    await this.kycService.resetApplicant(applicantId);
    return {
      statusCode: HttpStatus.OK,
      message: "Applicant reset successfully",
    };
  }
}
