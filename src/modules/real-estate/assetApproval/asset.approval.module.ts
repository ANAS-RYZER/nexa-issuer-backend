import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthIssuerModule } from "../../auth_issuer/auth_issuer.module";
import {
  assetApproval,
  AssetApprovalSchema,
} from "../schema/asset.approval.model";
import { Asset, AssetSchema } from "../schema/asset.model";
import { AssetApprovalController } from "./asset.approval.controller";
import { AssetApprovalService } from "./asset.approval.service";
import { EmailModule } from "@/infra/email/email.module";
import { AdminModule } from "../../admin/admin.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: assetApproval.name, schema: AssetApprovalSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
    EmailModule,
    AdminModule,
  ],
  controllers: [AssetApprovalController],
  providers: [AssetApprovalService],
  exports: [AssetApprovalService],
})
export class AssetApprovalModule {}
