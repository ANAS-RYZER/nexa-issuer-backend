import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NearByLocationController } from './nearByLocation.controller';
import { NearByLocationService } from './nearByLocation.service';
import {
  NearByLocation,
  NearByLocationSchema,
} from '../schema/nearByLocation.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NearByLocation.name, schema: NearByLocationSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    ConfigModule,
    AuthIssuerModule,
  ],
  controllers: [NearByLocationController],
  providers: [NearByLocationService],
  exports: [NearByLocationService],
})
export class NearByLocationModule {}

