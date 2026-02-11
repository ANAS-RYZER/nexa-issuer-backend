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
import { AssetDueDiligenceStructureService } from './assetDueDiligenceStructure.service';
import {
  CreateDueDiligenceStructureDto,
  UpdateDueDiligenceStructureDto,
  AssetIdQueryDto,
  DueDiligenceStructureIdParamsDto,
} from './dto';

@Controller('dueDiligenceStructure')
@UseGuards(JwtAuthGuard)
export class AssetDueDiligenceStructureController {
  constructor(
    private readonly dueDiligenceStructureService: AssetDueDiligenceStructureService,
  ) {}

  /**
   * Create a new due diligence structure by asset ID
   * POST /dueDiligenceStructure?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDueDiligenceStructure(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateDueDiligenceStructureDto,
  ) {
    const issuerId = req.user?.userId;
    const newDueDiligenceStructure =
      await this.dueDiligenceStructureService.createDueDiligenceStructure(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newDueDiligenceStructure,
      message: 'Due diligence structure created successfully',
    };
  }

  /**
   * Get a specific due diligence structure by ID
   * GET /dueDiligenceStructure/:dueDiligenceStructureId
   */
  @Get(':dueDiligenceStructureId')
  @HttpCode(HttpStatus.OK)
  async getDueDiligenceStructureById(
    @Req() req: any,
    @Param() params: DueDiligenceStructureIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceStructure =
      await this.dueDiligenceStructureService.getDueDiligenceStructureById(
        params.dueDiligenceStructureId,
        issuerId,
      );
    return {
      data: dueDiligenceStructure,
      message: 'Due diligence structure fetched successfully',
    };
  }

  /**
   * Update a specific due diligence structure by ID
   * PUT /dueDiligenceStructure/:dueDiligenceStructureId
   */
  @Put(':dueDiligenceStructureId')
  @HttpCode(HttpStatus.OK)
  async updateDueDiligenceStructure(
    @Req() req: any,
    @Param() params: DueDiligenceStructureIdParamsDto,
    @Body() updateDto: UpdateDueDiligenceStructureDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedDueDiligenceStructure =
      await this.dueDiligenceStructureService.updateDueDiligenceStructure(
        params.dueDiligenceStructureId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedDueDiligenceStructure,
      message: 'Due diligence structure updated successfully',
    };
  }

  /**
   * Get all due diligence structures for an asset
   * GET /dueDiligenceStructure/asset/all?assetId=...
   */
  @Get('asset/all')
  @HttpCode(HttpStatus.OK)
  async getAllDueDiligenceStructures(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceStructures =
      await this.dueDiligenceStructureService.getAllDueDiligenceStructuresByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: dueDiligenceStructures,
      message: 'Due diligence structures fetched successfully',
    };
  }

  /**
   * Delete a specific due diligence structure by ID
   * DELETE /dueDiligenceStructure/:dueDiligenceStructureId
   */
  @Delete(':dueDiligenceStructureId')
  @HttpCode(HttpStatus.OK)
  async deleteDueDiligenceStructure(
    @Req() req: any,
    @Param() params: DueDiligenceStructureIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const result =
      await this.dueDiligenceStructureService.deleteDueDiligenceStructure(
        params.dueDiligenceStructureId,
        issuerId,
      );
    return {
      data: result,
      message: 'Due diligence structure deleted successfully',
    };
  }
}

