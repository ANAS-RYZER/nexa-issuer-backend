import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, Param, Get } from '@nestjs/common';
import { SingleUploadDto } from './dto/single-image-upload.dto';
import { UploadService } from './upload.service';
import { BulkUploadDto } from './dto/bulk-upload.dto';

@Controller('S3-files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
    @Post('upload-single')
    @HttpCode(HttpStatus.OK)
    async uploadSingle(@Body() singleUploadDto: SingleUploadDto) {
        if (!singleUploadDto) {
          throw new BadRequestException(
            'Request body is required. Please send JSON (not form-data) with fileName, fileSize, mimeType, refId, and belongsTo fields.',
          );
        }
        console.log("singleUploadDto", singleUploadDto);
        const result = await this.uploadService.prepareSingleUpload(
            singleUploadDto.fileName,
            singleUploadDto.fileSize,
            singleUploadDto.mimeType,
            singleUploadDto.refId,
            singleUploadDto.belongsTo,
            singleUploadDto.isPublic,
            singleUploadDto.metadata,
          );
          return {
            message: 'Upload URL generated successfully',
            data: {
              uploadUrl: result.uploadUrl,
              requiredHeaders: result.requiredHeaders,
              assetS3Object: result.savedS3Object,
              expiresIn: result.expiresIn,
            },
          };      
    }

    @Get(':id/url')
  async getPermanentUrl(@Param('id') id: string) {
    const url = await this.uploadService.getPermanentUrl(id);
    return {
      message: 'URL retrieved successfully',
      data: {
        url,
      },
    };
  }
  @Post('bulk-upload')
  @HttpCode(HttpStatus.CREATED)
  async uploadBulk(@Body() bulkUploadDto: BulkUploadDto) {
    const results = await this.uploadService.prepareBulkUpload(bulkUploadDto.files);
    return {
      message: 'Upload URLs generated successfully',
      data: results.map((result: any) => ({
        uploadUrl: result.uploadUrl,
        assetS3Object: result.savedS3Object,
        expiresIn: result.expiresIn,
      })),
      count: results.length,
    };
  }

}