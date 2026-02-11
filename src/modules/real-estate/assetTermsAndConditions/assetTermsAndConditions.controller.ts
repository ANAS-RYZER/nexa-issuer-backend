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
import { AssetTermsAndConditionsService } from './assetTermsAndConditions.service';
import {
  CreateTermsAndConditionsDto,
  UpdateTermsAndConditionsDto,
  AssetIdQueryDto,
  TermsIdParamsDto,
} from './dto';

@Controller('termsAndConditions')
@UseGuards(JwtAuthGuard)
export class AssetTermsAndConditionsController {
  constructor(
    private readonly termsAndConditionsService: AssetTermsAndConditionsService,
  ) {}

  /**
   * Create new terms and conditions
   * POST /termsAndConditions?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTermsAndConditions(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateTermsAndConditionsDto,
  ) {
    const issuerId = req.user?.userId;
    const newTermsAndConditions =
      await this.termsAndConditionsService.createAssetTermsAndConditions(
        query.assetId,
        issuerId,
        createDto,
      );
    return {
      data: newTermsAndConditions,
      message: 'Terms and Conditions created successfully',
    };
  }

  /**
   * Get all terms and conditions for an asset
   * GET /termsAndConditions?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTermsAndConditions(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const termsAndConditions =
      await this.termsAndConditionsService.getAssetTermsAndConditionsByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: termsAndConditions,
      message: 'Terms and Conditions retrieved successfully',
    };
  }

  /**
   * Update terms and conditions
   * PUT /termsAndConditions/:termsId
   */
  @Put(':termsId')
  @HttpCode(HttpStatus.OK)
  async updateTermsAndConditions(
    @Req() req: any,
    @Param() params: TermsIdParamsDto,
    @Body() updateDto: UpdateTermsAndConditionsDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedTermsAndConditions =
      await this.termsAndConditionsService.updateAssetTermsAndConditions(
        params.termsId,
        issuerId,
        updateDto,
      );
    return {
      data: updatedTermsAndConditions,
      message: 'Terms and Conditions updated successfully',
    };
  }

  /**
   * Delete terms and conditions
   * DELETE /termsAndConditions/:termsId
   */
  @Delete(':termsId')
  @HttpCode(HttpStatus.OK)
  async deleteTermsAndConditions(
    @Req() req: any,
    @Param() params: TermsIdParamsDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedTermsAndConditions =
      await this.termsAndConditionsService.deleteAssetTermsAndConditions(
        params.termsId,
        issuerId,
      );
    return {
      data: deletedTermsAndConditions,
      message: 'Terms and Conditions deleted successfully',
    };
  }
}

