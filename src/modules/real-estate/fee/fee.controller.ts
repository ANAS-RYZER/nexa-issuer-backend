import { JwtAuthGuard } from "../../authIssuer/guards/jwt-auth.guard";
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
import { FeeService } from './fee.service';
import {
  CreateAssetFeeConfigDto,
  UpdateAssetFeeConfigDto,
  AssetIdQueryDto,
  FeeConfigIdParamsDto,
  GetAssetFeeConfigsQueryDto,
} from '../dto/fees.dto';

@Controller('fee')
@UseGuards(JwtAuthGuard)
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  /**
   * Create a new asset fee config
   * POST /fee?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetFeeConfig(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createAssetFeeConfigDto: CreateAssetFeeConfigDto,
  ) {
    const issuerId = req.user?.userId;
    const newAssetFeeConfig =
      await this.feeService.createAssetFeeConfig(
        query.assetId,
        issuerId,
        createAssetFeeConfigDto,
      );
    return {
      data: newAssetFeeConfig,
      message: 'Asset Fee Config created successfully',
    };
  }

  /**
   * Get all asset fee configs
   * GET /fee
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAssetFeeConfigs() {
    const assetFeeConfigs =
      await this.feeService.getAllAssetFeeConfigs();
    return {
      data: assetFeeConfigs,
      message: 'All Asset Fee Configs fetched successfully',
    };
  }

  /**
   * Get asset fee configs by asset ID
   * GET /fee/asset?assetId=...&feeType=...
   */
  @Get('asset')
  @HttpCode(HttpStatus.OK)
  async getAssetFeeConfigByAssetId(
    @Query() query: GetAssetFeeConfigsQueryDto,
  ) {
    const assetFeeConfigs =
      await this.feeService.getAssetFeeConfigByAssetId(
        query.assetId,
        query.feeType,
      );
    return {
      data: assetFeeConfigs,
      message: 'Asset Fee Configs fetched successfully',
    };
  }

  /**
   * Update an asset fee config
   * PUT /fee/:feeConfigId
   */
  @Put(':feeConfigId')
  @HttpCode(HttpStatus.OK)
  async updateAssetFeeConfig(
    @Param() params: FeeConfigIdParamsDto,
    @Body() updateAssetFeeConfigDto: UpdateAssetFeeConfigDto,
  ) {
    const updatedAssetFeeConfig =
      await this.feeService.updateAssetFeeConfig(
        params.feeConfigId,
        updateAssetFeeConfigDto,
      );
    return {
      data: updatedAssetFeeConfig,
      message: 'Asset Fee Config updated successfully',
    };
  }

  /**
   * Delete an asset fee config
   * DELETE /fee/:feeConfigId
   */
  @Delete(':feeConfigId')
  @HttpCode(HttpStatus.OK)
  async deleteAssetFeeConfig(@Param() params: FeeConfigIdParamsDto) {
    const deletedAssetFeeConfig =
      await this.feeService.deleteAssetFeeConfig(params.feeConfigId);
    return {
      data: deletedAssetFeeConfig,
      message: 'Asset Fee Config deleted successfully',
    };
  }
}