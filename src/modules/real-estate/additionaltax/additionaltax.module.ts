import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdditionalTaxController } from './additionaltax.controller';
import { AdditionalTaxService } from './additionaltax.service';
import {
  AdditionalTax,
  AdditionalTaxSchema,
} from '../schema/assetAdditionalTax.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdditionalTax.name, schema: AdditionalTaxSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AdditionalTaxController],
  providers: [AdditionalTaxService],
  exports: [AdditionalTaxService],
})
export class AdditionalTaxModule {}

