import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdditionalTaxService } from './additionaltax.service';
import { CreateAdditionalTaxDto } from './dto/create-additional-tax.dto';
import { UpdateAdditionalTaxDto } from './dto/update-additional-tax.dto';
import {
  AssetIdQueryDto,
  TaxIdParamDto,
} from './dto/additional-tax-query.dto';
import { JwtAuthGuard } from '../../authIssuer/guards/jwt-auth.guard';

@Controller('additional-tax')
@UseGuards(JwtAuthGuard)
export class AdditionalTaxController {
  constructor(
    private readonly additionalTaxService: AdditionalTaxService,
  ) {}

  /**
   * Create a new additional tax
   * POST /additional-tax?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAdditionalTax(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAdditionalTaxDto,
  ) {
    const issuerId = req.user?.userId;
    const newTax = await this.additionalTaxService.createAdditionalTax(
      query.assetId,
      issuerId,
      createDto,
    );

    return {
      data: newTax,
      message: 'Additional Tax created successfully',
    };
  }

  /**
   * Get all additional taxes for an asset
   * GET /additional-tax/asset?assetId=...
   */
  @Get('asset')
  @HttpCode(HttpStatus.OK)
  async getAllAdditionalTaxByProperty(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const taxes = await this.additionalTaxService.getAdditionalTaxByProperty(
      query.assetId,
      issuerId,
    );

    return {
      data: taxes,
      message: 'Additional Tax retrieved successfully',
    };
  }

  /**
   * Update an additional tax
   * PUT /additional-tax/:taxId
   */
  @Put(':taxId')
  @HttpCode(HttpStatus.OK)
  async updateAdditionalTax(
    @Req() req: any,
    @Param() params: TaxIdParamDto,
    @Body() updateDto: UpdateAdditionalTaxDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedTax = await this.additionalTaxService.updateAdditionalTax(
      params.taxId,
      issuerId,
      updateDto,
    );

    return {
      data: updatedTax,
      message: 'Additional Tax updated successfully',
    };
  }

  /**
   * Delete an additional tax
   * DELETE /additional-tax/:taxId
   */
  @Delete(':taxId')
  @HttpCode(HttpStatus.OK)
  async deleteAdditionalTax(
    @Req() req: any,
    @Param() params: TaxIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedTax = await this.additionalTaxService.deleteAdditionalTax(
      params.taxId,
      issuerId,
    );

    return {
      data: deletedTax,
      message: 'Additional Tax deleted Successfully',
    };
  }
}

