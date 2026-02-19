import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetTermsAndConditionsController } from './assetTermsAndConditions.controller';
import { AssetTermsAndConditionsService } from './assetTermsAndConditions.service';
import {
  AssetTermsAndConditions,
  AssetTermsAndConditionsSchema,
} from '../schema/assetTermsAndConditions.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AssetTermsAndConditions.name,
        schema: AssetTermsAndConditionsSchema,
      },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetTermsAndConditionsController],
  providers: [AssetTermsAndConditionsService],
  exports: [AssetTermsAndConditionsService],
})
export class AssetTermsAndConditionsModule {}

