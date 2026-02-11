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
import { AssetDueDiligenceLegalService } from './assetDueDiligenceLegal.service';
import {
  CreateDueDiligenceLegalDto,
  UpdateDueDiligenceLegalDto,
  AssetIdQueryDto,
  DueDiligenceLegalIdParamsDto,
} from './dto';

@Controller('dueDiligenceLegal')
@UseGuards(JwtAuthGuard)
export class AssetDueDiligenceLegalController {
  constructor(
    private readonly dueDiligenceLegalService: AssetDueDiligenceLegalService,
  ) {}

  /**
   * Create a new due diligence legal by asset ID
   * POST /dueDiligenceLegal?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDueDiligenceLegal(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateDueDiligenceLegalDto,
  ) {
    const issuerId = req.user?.userId;
    const newDueDiligenceLegal =
      await this.dueDiligenceLegalService.createDueDiligenceLegal(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newDueDiligenceLegal,
      message: 'Due diligence legal created successfully',
    };
  }

  /**
   * Get a specific due diligence legal by ID
   * GET /dueDiligenceLegal/:dueDiligenceLegalId
   */
  @Get(':dueDiligenceLegalId')
  @HttpCode(HttpStatus.OK)
  async getDueDiligenceLegalById(
    @Req() req: any,
    @Param() params: DueDiligenceLegalIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceLegal =
      await this.dueDiligenceLegalService.getDueDiligenceLegalById(
        params.dueDiligenceLegalId,
        issuerId,
      );
    return {
      data: dueDiligenceLegal,
      message: 'Due diligence legal fetched successfully',
    };
  }

  /**
   * Update a specific due diligence legal by ID
   * PUT /dueDiligenceLegal/:dueDiligenceLegalId
   */
  @Put(':dueDiligenceLegalId')
  @HttpCode(HttpStatus.OK)
  async updateDueDiligenceLegal(
    @Req() req: any,
    @Param() params: DueDiligenceLegalIdParamsDto,
    @Body() updateDto: UpdateDueDiligenceLegalDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedDueDiligenceLegal =
      await this.dueDiligenceLegalService.updateDueDiligenceLegal(
        params.dueDiligenceLegalId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedDueDiligenceLegal,
      message: 'Due diligence legal updated successfully',
    };
  }

  /**
   * Get all due diligence legals for an asset
   * GET /dueDiligenceLegal/asset/all?assetId=...
   */
  @Get('asset/all')
  @HttpCode(HttpStatus.OK)
  async getAllDueDiligenceLegals(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const dueDiligenceLegals =
      await this.dueDiligenceLegalService.getAllDueDiligenceLegalsByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: dueDiligenceLegals,
      message: 'Due diligence legals fetched successfully',
    };
  }

  /**
   * Delete a specific due diligence legal by ID
   * DELETE /dueDiligenceLegal/:dueDiligenceLegalId
   */
  @Delete(':dueDiligenceLegalId')
  @HttpCode(HttpStatus.OK)
  async deleteDueDiligenceLegal(
    @Req() req: any,
    @Param() params: DueDiligenceLegalIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const result =
      await this.dueDiligenceLegalService.deleteDueDiligenceLegal(
        params.dueDiligenceLegalId,
        issuerId,
      );
    return {
      data: result,
      message: 'Due diligence legal deleted successfully',
    };
  }
}

