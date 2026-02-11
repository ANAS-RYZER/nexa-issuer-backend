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
import { AssetDueDiligenceValuationService } from './assetDueDiligenceValuation.service';
import {
  CreateDueDiligenceValuationDto,
  UpdateDueDiligenceValuationDto,
  AssetIdQueryDto,
  DueDiligenceValuationIdParamsDto,
} from './dto';

@Controller('dueDiligenceValuation')
@UseGuards(JwtAuthGuard)
export class AssetDueDiligenceValuationController {
  constructor(
    private readonly dueDiligenceValuationService: AssetDueDiligenceValuationService,
  ) {}

  /**
   * Create a new due diligence valuation by asset ID
   * POST /dueDiligenceValuation?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDueDiligenceValuation(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateDueDiligenceValuationDto,
  ) {
    const issuerId = req.user?.userId;
    const newDueDiligenceValuation =
      await this.dueDiligenceValuationService.createDueDiligenceValuation(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newDueDiligenceValuation,
      message: 'Due diligence valuation created successfully',
    };
  }

  /**
   * Get a specific due diligence valuation by ID
   * GET /dueDiligenceValuation/:dueDiligenceValuationId
   */
  @Get(':dueDiligenceValuationId')
  @HttpCode(HttpStatus.OK)
  async getDueDiligenceValuationById(
    @Req() req: any,
    @Param() params: DueDiligenceValuationIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceValuation =
      await this.dueDiligenceValuationService.getDueDiligenceValuationById(
        params.dueDiligenceValuationId,
        issuerId,
      );
    return {
      data: dueDiligenceValuation,
      message: 'Due diligence valuation fetched successfully',
    };
  }

  /**
   * Update a specific due diligence valuation by ID
   * PUT /dueDiligenceValuation/:dueDiligenceValuationId
   */
  @Put(':dueDiligenceValuationId')
  @HttpCode(HttpStatus.OK)
  async updateDueDiligenceValuation(
    @Req() req: any,
    @Param() params: DueDiligenceValuationIdParamsDto,
    @Body() updateDto: UpdateDueDiligenceValuationDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedDueDiligenceValuation =
      await this.dueDiligenceValuationService.updateDueDiligenceValuation(
        params.dueDiligenceValuationId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedDueDiligenceValuation,
      message: 'Due diligence valuation updated successfully',
    };
  }

  /**
   * Get all due diligence valuations for an asset
   * GET /dueDiligenceValuation/asset/all?assetId=...
   */
  @Get('asset/all')
  @HttpCode(HttpStatus.OK)
  async getAllDueDiligenceValuations(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceValuations =
      await this.dueDiligenceValuationService.getAllDueDiligenceValuationsByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: dueDiligenceValuations,
      message: 'Due diligence valuations fetched successfully',
    };
  }

  /**
   * Delete a specific due diligence valuation by ID
   * DELETE /dueDiligenceValuation/:dueDiligenceValuationId
   */
  @Delete(':dueDiligenceValuationId')
  @HttpCode(HttpStatus.OK)
  async deleteDueDiligenceValuation(
    @Req() req: any,
    @Param() params: DueDiligenceValuationIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const result =
      await this.dueDiligenceValuationService.deleteDueDiligenceValuation(
        params.dueDiligenceValuationId,
        issuerId,
      );
    return {
      data: result,
      message: 'Due diligence valuation deleted successfully',
    };
  }
}

