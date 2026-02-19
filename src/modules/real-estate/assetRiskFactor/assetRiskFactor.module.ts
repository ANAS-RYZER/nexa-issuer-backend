import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetRiskFactorController } from './assetRiskFactor.controller';
import { AssetRiskFactorService } from './assetRiskFactor.service';
import { RiskFactor, RiskFactorSchema } from '../schema/assetRiskFactor.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiskFactor.name, schema: RiskFactorSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetRiskFactorController],
  providers: [AssetRiskFactorService],
  exports: [AssetRiskFactorService],
})
export class AssetRiskFactorModule {}

