import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetDueDiligenceValuationController } from './assetDueDiligenceValuation.controller';
import { AssetDueDiligenceValuationService } from './assetDueDiligenceValuation.service';
import {
  AssetDueDiligenceValuation,
  AssetDueDiligenceValuationSchema,
} from '../schema/assetDueDiligenceValuation.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AssetDueDiligenceValuation.name,
        schema: AssetDueDiligenceValuationSchema,
      },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetDueDiligenceValuationController],
  providers: [AssetDueDiligenceValuationService],
  exports: [AssetDueDiligenceValuationService],
})
export class AssetDueDiligenceValuationModule {}

