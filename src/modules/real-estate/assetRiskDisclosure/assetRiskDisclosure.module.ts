import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetRiskDisclosureController } from './assetRiskDisclosure.controller';
import { AssetRiskDisclosureService } from './assetRiskDisclosure.service';
import {
  RiskDisclosure,
  RiskDisclosureSchema,
} from '../schema/assetRiskDisclosure.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiskDisclosure.name, schema: RiskDisclosureSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetRiskDisclosureController],
  providers: [AssetRiskDisclosureService],
  exports: [AssetRiskDisclosureService],
})
export class AssetRiskDisclosureModule {}

