import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetFeatureController } from './assetFeature.controller';
import { AssetFeatureService } from './assetFeature.service';
import {
  AssetFeature,
  AssetFeatureSchema,
} from '../schema/assetFeature.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetFeature.name, schema: AssetFeatureSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetFeatureController],
  providers: [AssetFeatureService],
  exports: [AssetFeatureService],
})
export class AssetFeatureModule {}

