import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Asset, AssetSchema } from "./schema/asset.model";
import {
  AssetFeeConfig,
  AssetFeeConfigSchema,
} from "./schema/assetFeeConfig.model";
import { AssetExpense, AssetExpenseSchema } from "./schema/assetExpense.model";
import { SPV, SPVSchema } from "../spv/schemas/spv.schema";
import {
  IssuerUser,
  IssuerUserSchema,
} from "../authIssuer/schemas/issuer-user.schema";
import { AssetController } from "./real-estate.controller";
import { AssetService } from "./real-estate.service";
import { AuthIssuerModule } from "../authIssuer/auth_issuer.module";
import { AuthModule } from "../auth/auth.module";
import { FeeModule } from "./fee/fee.module";
import { ExpenseModule } from "./expenses/expense.module";
import { AdditionalTaxModule } from "./additionaltax/additionaltax.module";
import { AllocationCategoryModule } from "./allocationCategory/allocationCategory.module";
import { AmenityModule } from "./amenity/amenity.module";
import { AssetDocumentModule } from "./assetDocument/assetDocument.module";
import { AssetDueDiligenceLegalModule } from "./assetDueDiligenceLegal/assetDueDiligenceLegal.module";
import { AssetDueDiligenceStructureModule } from "./assetDueDiligenceStructure/assetDueDiligenceStructure.module";
import { AssetDueDiligenceValuationModule } from "./assetDueDiligenceValuation/assetDueDiligenceValuation.module";
import { AssetExitOpportunityModule } from "./assetExitOpportunity/assetExitOpportunity.module";
import { AssetFaqModule } from "./assetFAQ/assetFAQ.module";
import { AssetFeatureModule } from "./assetFeature/assetFeature.module";
import { AssetRiskDisclosureModule } from "./assetRiskDisclosure/assetRiskDisclosure.module";
import { AssetRiskFactorModule } from "./assetRiskFactor/assetRiskFactor.module";
import { AssetTenantModule } from "./assetTenant/assetTenant.module";
import { AssetTermsAndConditionsModule } from "./assetTermsAndConditions/assetTermsAndConditions.module";
import { NearByLocationModule } from "./nearByLocation/nearByLocation.module";
import { AssetApprovalModule } from "./assetApproval/asset.approval.module";
import { IpLocationService } from "../ip/ip.service";
import { ExchangeRateModule } from "../exchangeRate/exchange-rate.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: AssetFeeConfig.name, schema: AssetFeeConfigSchema },
      { name: AssetExpense.name, schema: AssetExpenseSchema },
      { name: SPV.name, schema: SPVSchema },
      { name: IssuerUser.name, schema: IssuerUserSchema }, // Add IssuerUser for population
    ]),
    AuthIssuerModule,
    AuthModule, // User auth for OptionalJwtAuthGuard
    FeeModule,
    ExpenseModule,
    AdditionalTaxModule,
    AllocationCategoryModule,
    AmenityModule,
    AssetDocumentModule,
    AssetDueDiligenceLegalModule,
    AssetDueDiligenceStructureModule,
    AssetDueDiligenceValuationModule,
    AssetExitOpportunityModule,
    AssetFaqModule,
    AssetFeatureModule,
    AssetRiskDisclosureModule,
    AssetRiskFactorModule,
    AssetTenantModule,
    AssetTermsAndConditionsModule,
    NearByLocationModule,
    AssetApprovalModule,
    ExchangeRateModule,
  ],
  controllers: [AssetController],
  providers: [AssetService, IpLocationService],
  exports: [
    AssetService,
    MongooseModule, // Export MongooseModule so other modules can access the models
  ],
})
export class AssetModule {}
