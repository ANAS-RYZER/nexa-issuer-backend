import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetS3Object, AssetS3ObjectSchema } from './schema/asset-s3-object.schema';
import { GcpStorageModule } from '../../infra/gcp/gcp-storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetS3Object.name, schema: AssetS3ObjectSchema },
    ]),
    GcpStorageModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}