import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';
import {
  AssetAmenity,
  AssetAmenitySchema,
} from '../schema/assetAmenity.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetAmenity.name, schema: AssetAmenitySchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AmenityController],
  providers: [AmenityService],
  exports: [AmenityService],
})
export class AmenityModule {}

