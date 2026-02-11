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
import { AssetRiskFactorService } from './assetRiskFactor.service';
import {
  CreateRiskFactorDto,
  UpdateRiskFactorDto,
  AssetIdQueryDto,
  RiskFactorIdParamsDto,
} from './dto';

@Controller('riskFactor')
@UseGuards(JwtAuthGuard)
export class AssetRiskFactorController {
  constructor(private readonly riskFactorService: AssetRiskFactorService) {}

  /**
   * Create a new risk factor
   * POST /riskFactor?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRiskFactor(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateRiskFactorDto,
  ) {
    const issuerId = req.user?.userId;
    const newRiskFactor = await this.riskFactorService.createRiskFactor(
      query.assetId,
      issuerId,
      createDto,
    );
    return {
      data: newRiskFactor,
      message: 'Risk Factor created successfully',
    };
  }

  /**
   * Get all risk factors for an asset
   * GET /riskFactor?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRiskFactors(@Req() req: any, @Query() query: AssetIdQueryDto) {
    const issuerId = req.user?.userId;
    const riskFactors = await this.riskFactorService.getRiskFactorsByProperty(
      query.assetId,
      issuerId,
    );
    return {
      data: riskFactors,
      message: 'Risk Factor retrieved successfully',
    };
  }

  /**
   * Update a risk factor
   * PUT /riskFactor/:riskFactorId
   */
  @Put(':riskFactorId')
  @HttpCode(HttpStatus.OK)
  async updateRiskFactor(
    @Req() req: any,
    @Param() params: RiskFactorIdParamsDto,
    @Body() updateDto: UpdateRiskFactorDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedRiskFactor = await this.riskFactorService.updateRiskFactor(
      params.riskFactorId,
      issuerId,
      updateDto,
    );
    return {
      data: updatedRiskFactor,
      message: 'Risk Factor updated successfully',
    };
  }

  /**
   * Delete a risk factor
   * DELETE /riskFactor/:riskFactorId
   */
  @Delete(':riskFactorId')
  @HttpCode(HttpStatus.OK)
  async deleteRiskFactor(
    @Req() req: any,
    @Param() params: RiskFactorIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedRiskFactor = await this.riskFactorService.deleteRiskFactor(
      params.riskFactorId,
      issuerId,
    );
    return {
      data: deletedRiskFactor,
      message: 'Risk Factor deleted Successfully',
    };
  }
}

