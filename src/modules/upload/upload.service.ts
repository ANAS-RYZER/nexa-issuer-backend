import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IAssetS3Object, IS3ObjectType, MimeTypes } from './interfaces/asset-s3-object.interface';
import { GcpStorageService } from '../../infra/gcp/gcp-storage.service';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AssetS3Object, AssetS3ObjectDocument } from './schema/asset-s3-object.schema';

@Injectable()
export class UploadService {
    private readonly bucketName: string;
    constructor(
        @InjectModel(AssetS3Object.name) private assetS3ObjectModel: Model<AssetS3ObjectDocument>,
        private readonly gcpStorageService: GcpStorageService,
        private readonly configService: ConfigService,
    )
     {
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';
        if (!this.bucketName) {
          throw new Error(
            'GCP_BUCKET_NAME environment variable is required. Please set it in your .env file.',
          );
        }
     }
     async prepareSingleUpload(
        fileName: string,
        fileSize: number,
        mimeType: MimeTypes,
        refId: string,
        belongsTo: IS3ObjectType,
        isPublic: boolean = false,
        metadata: Record<string, any> = {},
      ): Promise<{
        uploadUrl: string;
        savedS3Object: IAssetS3Object;
        expiresIn: number;
        requiredHeaders: Record<string, string>;
      }> {
        // Validate the reference entity exists (basic validation - you may want to add actual entity checks)
        if (!Object.values(IS3ObjectType).includes(belongsTo)) {
          throw new BadRequestException(
            `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}`,
          );
        }
    
        // Generate presigned URL
        const { url, key: storageKey, expiresIn, requiredHeaders } =
          await this.gcpStorageService.getPresignedUploadUrl(
          fileName,
          mimeType,
          refId,
          belongsTo,
          metadata,
        );
    
        // Create asset record
        const savedS3Object = await this.assetS3ObjectModel.create({
          refId,
          belongsTo,
          fileName,
          fileSize,
          mimeType,
          key: storageKey,
          bucket: this.bucketName,
          isPublic,
          metadata,
        });
    
        return {
          uploadUrl: url,
          savedS3Object: savedS3Object.toObject() as unknown as IAssetS3Object,
          expiresIn,
          requiredHeaders,
        };
      }

      async getPermanentUrl(id: string): Promise<string> {
        const assetS3Object = await this.assetS3ObjectModel.findById(id);
        if (!assetS3Object) {
          throw new NotFoundException('Asset S3 Object not found, Make sure the id is correct');
        }
    
        return this.gcpStorageService.getPublicUrl(assetS3Object.key);
      }

      async prepareBulkUpload(
        files: Array<{
          fileName: string;
          fileSize: number;
          mimeType: MimeTypes;
          refId: string;
          belongsTo: IS3ObjectType;
          isPublic?: boolean;
          metadata?: Record<string, any>;
        }>,
      ): Promise<Array<{
        uploadUrl: string;
        savedS3Object: IAssetS3Object;
        expiresIn: number;
      }>> {
        const results = await Promise.all(
          files.map((file) =>
            this.prepareSingleUpload(
              file.fileName,
              file.fileSize,
              file.mimeType,
              file.refId,
              file.belongsTo,
              file.isPublic || false,
              file.metadata || {},
            ),
          ),
        );
    
        return results;
      }

}