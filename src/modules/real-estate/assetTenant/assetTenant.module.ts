import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetTenantController } from './assetTenant.controller';
import { AssetTenantService } from './assetTenant.service';
import { AssetTenant, AssetTenantSchema } from '../schema/assetTenant.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetTenant.name, schema: AssetTenantSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetTenantController],
  providers: [AssetTenantService],
  exports: [AssetTenantService],
})
export class AssetTenantModule {}

