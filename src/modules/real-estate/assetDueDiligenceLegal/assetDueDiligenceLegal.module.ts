import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetDueDiligenceLegalController } from './assetDueDiligenceLegal.controller';
import { AssetDueDiligenceLegalService } from './assetDueDiligenceLegal.service';
import {
  AssetDueDiligenceLegal,
  AssetDueDiligenceLegalSchema,
} from '../schema/assetDueDiligenceLegal.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AssetDueDiligenceLegal.name,
        schema: AssetDueDiligenceLegalSchema,
      },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetDueDiligenceLegalController],
  providers: [AssetDueDiligenceLegalService],
  exports: [AssetDueDiligenceLegalService],
})
export class AssetDueDiligenceLegalModule {}

