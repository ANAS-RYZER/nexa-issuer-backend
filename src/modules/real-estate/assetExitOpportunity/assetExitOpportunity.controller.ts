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
import { AssetExitOpportunityService } from './assetExitOpportunity.service';
import {
  CreateExitOpportunityDto,
  UpdateExitOpportunityDto,
  AssetIdQueryDto,
  ExitOpportunityIdParamsDto,
} from './dto';

@Controller('exitOpportunity')
@UseGuards(JwtAuthGuard)
export class AssetExitOpportunityController {
  constructor(
    private readonly exitOpportunityService: AssetExitOpportunityService,
  ) {}

  /**
   * Create a new exit opportunity
   * POST /exitOpportunity?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createExitOpportunity(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateExitOpportunityDto,
  ) {
    const issuerId = req.user?.userId;
    const newExitOpportunity =
      await this.exitOpportunityService.createExitOpportunity(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newExitOpportunity,
      message: 'Exit Opportunity created successfully',
    };
  }

  /**
   * Get all exit opportunities for an asset
   * GET /exitOpportunity?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllExitOpportunities(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const exitOpportunities =
      await this.exitOpportunityService.getExitOpportunitiesByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: exitOpportunities,
      message: 'Exit Opportunity retrieved successfully',
    };
  }

  /**
   * Update an exit opportunity
   * PUT /exitOpportunity/:exitOpportunityId
   */
  @Put(':exitOpportunityId')
  @HttpCode(HttpStatus.OK)
  async updateExitOpportunity(
    @Req() req: any,
    @Param() params: ExitOpportunityIdParamsDto,
    @Body() updateDto: UpdateExitOpportunityDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedExitOpportunity =
      await this.exitOpportunityService.updateExitOpportunity(
        params.exitOpportunityId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedExitOpportunity,
      message: 'Exit Opportunity updated successfully',
    };
  }

  /**
   * Delete an exit opportunity
   * DELETE /exitOpportunity/:exitOpportunityId
   */
  @Delete(':exitOpportunityId')
  @HttpCode(HttpStatus.OK)
  async deleteExitOpportunity(
    @Req() req: any,
    @Param() params: ExitOpportunityIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedExitOpportunity =
      await this.exitOpportunityService.deleteExitOpportunity(
        params.exitOpportunityId,
        issuerId,
      );
    return {
      data: deletedExitOpportunity,
      message: 'Exit Opportunity deleted Successfully',
    };
  }
}

