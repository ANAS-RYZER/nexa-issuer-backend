import { JwtAuthGuard } from "../../auth_issuer/guards/jwt-auth.guard";
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
import { AssetFeatureService } from './assetFeature.service';
import {
  CreateAssetFeatureDto,
  UpdateAssetFeatureDto,
  AssetIdQueryDto,
  FeatureIdParamsDto,
} from './dto';

@Controller('feature')
@UseGuards(JwtAuthGuard)
export class AssetFeatureController {
  constructor(private readonly featureService: AssetFeatureService) {}

  /**
   * Create a new asset feature
   * POST /feature?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetFeature(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAssetFeatureDto,
  ) {
    const issuerId = req.user?.userId;
    const newFeature = await this.featureService.createAssetFeature(
      query.assetId,
      issuerId,
      createDto,
    );
    return {
      data: newFeature,
      message: 'Asset feature created successfully',
    };
  }

  /**
   * Get all asset features
   * GET /feature?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAssetFeatures(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const features = await this.featureService.getAllAssetFeatures(
      query.assetId,
      issuerId,
    );
    return {
      data: features,
      message: 'Asset features retrieved successfully',
    };
  }

  /**
   * Update an asset feature
   * PUT /feature/:featureId
   */
  @Put(':featureId')
  @HttpCode(HttpStatus.OK)
  async updateAssetFeature(
    @Req() req: any,
    @Param() params: FeatureIdParamsDto,
    @Body() updateDto: UpdateAssetFeatureDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedFeature = await this.featureService.updateAssetFeature(
      params.featureId,
      issuerId,
      updateDto,
    );
    return {
      data: updatedFeature,
      message: 'Asset feature updated successfully',
    };
  }

  /**
   * Delete an asset feature
   * DELETE /feature/:featureId
   */
  @Delete(':featureId')
  @HttpCode(HttpStatus.OK)
  async deleteAssetFeature(
    @Req() req: any,
    @Param() params: FeatureIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedFeature = await this.featureService.deleteAssetFeature(
      params.featureId,
      issuerId,
    );
    return {
      data: deletedFeature,
      message: 'Asset feature deleted successfully',
    };
  }
}

