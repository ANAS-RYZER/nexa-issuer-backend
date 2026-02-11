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
import { AssetRiskDisclosureService } from './assetRiskDisclosure.service';
import {
  CreateRiskDisclosureDto,
  UpdateRiskDisclosureDto,
  AssetIdQueryDto,
  RiskDisclosureIdParamsDto,
} from './dto';

@Controller('riskDisclosure')
@UseGuards(JwtAuthGuard)
export class AssetRiskDisclosureController {
  constructor(
    private readonly riskDisclosureService: AssetRiskDisclosureService,
  ) {}

  /**
   * Create a new risk disclosure
   * POST /riskDisclosure?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRiskDisclosure(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateRiskDisclosureDto,
  ) {
    const issuerId = req.user?.userId;
    const newRiskDisclosure =
      await this.riskDisclosureService.createRiskDisclosure(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newRiskDisclosure,
      message: 'Risk Disclosure created successfully',
    };
  }

  /**
   * Get all risk disclosures for an asset
   * GET /riskDisclosure?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRiskDisclosures(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const riskDisclosures =
      await this.riskDisclosureService.getRiskDisclosureByProperty(
        query.assetId,
        issuerId,
      );
    return {
      data: riskDisclosures,
      message: 'Risk Disclosure retrieved successfully',
    };
  }

  /**
   * Update a risk disclosure
   * PUT /riskDisclosure/:riskDisclosureId
   */
  @Put(':riskDisclosureId')
  @HttpCode(HttpStatus.OK)
  async updateRiskDisclosure(
    @Req() req: any,
    @Param() params: RiskDisclosureIdParamsDto,
    @Body() updateDto: UpdateRiskDisclosureDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedRiskDisclosure =
      await this.riskDisclosureService.updateRiskDisclosure(
        params.riskDisclosureId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedRiskDisclosure,
      message: 'Risk Disclosure updated successfully',
    };
  }

  /**
   * Delete a risk disclosure
   * DELETE /riskDisclosure/:riskDisclosureId
   */
  @Delete(':riskDisclosureId')
  @HttpCode(HttpStatus.OK)
  async deleteRiskDisclosure(
    @Req() req: any,
    @Param() params: RiskDisclosureIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedRiskDisclosure =
      await this.riskDisclosureService.deleteRiskDisclosure(
        params.riskDisclosureId,
        issuerId,
      );
    return {
      data: deletedRiskDisclosure,
      message: 'Risk Disclosure deleted Successfully',
    };
  }
}

