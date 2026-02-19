import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetDueDiligenceStructureController } from './assetDueDiligenceStructure.controller';
import { AssetDueDiligenceStructureService } from './assetDueDiligenceStructure.service';
import {
  AssetDueDiligenceStructure,
  AssetDueDiligenceStructureSchema,
} from '../schema/assetDueDiligenceStructure.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AssetDueDiligenceStructure.name,
        schema: AssetDueDiligenceStructureSchema,
      },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetDueDiligenceStructureController],
  providers: [AssetDueDiligenceStructureService],
  exports: [AssetDueDiligenceStructureService],
})
export class AssetDueDiligenceStructureModule {}

