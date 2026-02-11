import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetExitOpportunityController } from './assetExitOpportunity.controller';
import { AssetExitOpportunityService } from './assetExitOpportunity.service';
import {
  ExitOpportunity,
  ExitOpportunitySchema,
} from '../schema/assetExitOpportunity.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExitOpportunity.name, schema: ExitOpportunitySchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetExitOpportunityController],
  providers: [AssetExitOpportunityService],
  exports: [AssetExitOpportunityService],
})
export class AssetExitOpportunityModule {}

