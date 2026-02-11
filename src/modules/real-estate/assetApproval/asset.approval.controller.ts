import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "@/modules/auth_issuer/guards/jwt-auth.guard";
import { AssetApprovalService } from "./asset.approval.service";
import { SendAssetApprovalDto } from "./dto/send-asset-approval.dto";

@Controller("asset-approval")
export class AssetApprovalController {
  constructor(private readonly service: AssetApprovalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: any,
    @Query("assetId") assetId: string,
    @Body() dto: SendAssetApprovalDto,
  ) {
    const issuerId = req.user?.userId;
    const data = await this.service.sendAssetApproval(issuerId, assetId, dto);
    return {
      message: "Asset approval created successfully",
      data,
    };
  }
}
