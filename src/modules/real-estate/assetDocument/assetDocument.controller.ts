import { JwtAuthGuard } from '@/modules/auth_issuer/guards/jwt-auth.guard';
import {
  Controller,
  HttpCode,
  UseGuards,
  Post,
  Get,
  Put,
  Delete,
  HttpStatus,
  Body,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { AssetDocumentService } from './assetDocument.service';
import {
  CreateAssetDocumentDto,
  UpdateAssetDocumentDto,
  AssetIdQueryDto,
  DocumentIdParamsDto,
} from './dto';

@Controller('assetDocument')
@UseGuards(JwtAuthGuard)
export class AssetDocumentController {
  constructor(
    private readonly assetDocumentService: AssetDocumentService,
  ) {}

  /**
   * Create a new asset document by asset ID
   * POST /assetDocument?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetDocument(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAssetDocumentDto,
  ) {
    const issuerId = req.user?.userId;
    const newAssetDocument =
      await this.assetDocumentService.createAssetDocument(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newAssetDocument,
      message: 'Asset document created successfully',
    };
  }

  /**
   * Get a specific asset document by document ID
   * GET /assetDocument/:documentId
   */
  @Get(':documentId')
  @HttpCode(HttpStatus.OK)
  async getDocumentByDocumentId(
    @Req() req: any,
    @Param() params: DocumentIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const document = await this.assetDocumentService.getDocumentByDocumentId(
      params.documentId,
      issuerId,
    );
    return {
      data: document,
      message: 'Asset document fetched successfully',
    };
  }

  /**
   * Update a specific asset document by document ID
   * PUT /assetDocument/:documentId
   */
  @Put(':documentId')
  @HttpCode(HttpStatus.OK)
  async updateAssetDocument(
    @Req() req: any,
    @Param() params: DocumentIdParamsDto,
    @Body() updateDto: UpdateAssetDocumentDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedDocument =
      await this.assetDocumentService.updateAssetDocument(
        params.documentId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedDocument,
      message: 'Asset document updated successfully',
    };
  }

  /**
   * Get all documents for an asset
   * GET /assetDocument/asset/all?assetId=...
   */
  @Get('asset/all')
  @HttpCode(HttpStatus.OK)
  async getAllDocumentsByAssetId(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const documents = await this.assetDocumentService.getAllDocumentsByAssetId(
      query.assetId,
      issuerId,
    );
    return {
      data: documents,
      message: 'Asset documents fetched successfully',
    };
  }

  /**
   * Delete all documents for an asset
   * DELETE /assetDocument/asset/all?assetId=...
   */
  @Delete('asset/all')
  @HttpCode(HttpStatus.OK)
  async deleteAllAssetDocuments(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const result = await this.assetDocumentService.deleteAllAssetDocuments(
      query.assetId,
      issuerId,
    );
    return {
      data: result,
      message: `Successfully deleted ${result.deletedCount} asset documents`,
    };
  }

  /**
   * Delete a specific asset document by document ID
   * DELETE /assetDocument/:documentId
   */
  @Delete(':documentId')
  @HttpCode(HttpStatus.OK)
  async deleteAssetDocument(
    @Req() req: any,
    @Param() params: DocumentIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const result = await this.assetDocumentService.deleteAssetDocument(
      params.documentId,
      issuerId,
    );
    return {
      data: result,
      message: 'Asset document deleted successfully',
    };
  }
}

