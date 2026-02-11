import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetDocumentController } from './assetDocument.controller';
import { AssetDocumentService } from './assetDocument.service';
import { AssetDoc, AssetDocumentSchema } from '../schema/assetDocument.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetDoc.name, schema: AssetDocumentSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AssetDocumentController],
  providers: [AssetDocumentService],
  exports: [AssetDocumentService],
})
export class AssetDocumentModule {}

