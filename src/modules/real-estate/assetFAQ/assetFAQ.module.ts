import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetFaqController } from './assetFAQ.controller';
import { AssetFaqService } from './assetFAQ.service';
import { Faq, FaqSchema } from '../schema/assetFAQ.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faq.name, schema: FaqSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetFaqController],
  providers: [AssetFaqService],
  exports: [AssetFaqService],
})
export class AssetFaqModule {}

