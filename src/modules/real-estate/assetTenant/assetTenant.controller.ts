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
import { AssetTenantService } from './assetTenant.service';
import {
  CreateAssetTenantDto,
  UpdateAssetTenantDto,
  AssetIdQueryDto,
  TenantIdParamsDto,
} from './dto';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class AssetTenantController {
  constructor(private readonly assetTenantService: AssetTenantService) {}

  /**
   * Create a new asset tenant
   * POST /tenant?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetTenant(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAssetTenantDto,
  ) {
    const issuerId = req.user?.userId;
    const newTenant = await this.assetTenantService.createAssetTenant(
      query.assetId,
      issuerId,
      createDto,
    );
    return {
      data: newTenant,
      message: 'Asset tenant created successfully',
    };
  }

  /**
   * Get all tenants for an asset
   * GET /tenant?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTenants(@Req() req: any, @Query() query: AssetIdQueryDto) {
    const issuerId = req.user?.userId;
    const tenants = await this.assetTenantService.getAllTenantsByAssetId(
      query.assetId,
      issuerId,
    );
    return {
      data: tenants,
      message: 'Asset tenants fetched successfully',
    };
  }

  /**
   * Get a specific tenant by ID
   * GET /tenant/:tenantId
   */
  @Get(':tenantId')
  @HttpCode(HttpStatus.OK)
  async getTenant(@Req() req: any, @Param() params: TenantIdParamsDto) {
    const issuerId = req.user?.userId;
    const tenant = await this.assetTenantService.getAssetTenantById(
      params.tenantId,
      issuerId,
    );
    return {
      data: tenant,
      message: 'Asset tenant fetched successfully',
    };
  }

  /**
   * Update a tenant
   * PUT /tenant/:tenantId
   */
  @Put(':tenantId')
  @HttpCode(HttpStatus.OK)
  async updateTenant(
    @Req() req: any,
    @Param() params: TenantIdParamsDto,
    @Body() updateDto: UpdateAssetTenantDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedTenant = await this.assetTenantService.updateAssetTenantById(
      params.tenantId,
      issuerId,
      updateDto,
    );
    return {
      data: updatedTenant,
      message: 'Asset tenant updated successfully',
    };
  }

  /**
   * Delete a specific tenant
   * DELETE /tenant/:tenantId
   */
  @Delete(':tenantId')
  @HttpCode(HttpStatus.OK)
  async deleteTenant(@Req() req: any, @Param() params: TenantIdParamsDto) {
    const issuerId = req.user?.userId;
    await this.assetTenantService.deleteAssetTenantById(
      params.tenantId,
      issuerId,
    );
    return {
      data: null,
      message: 'Asset tenant deleted successfully',
    };
  }

  /**
   * Delete all tenants for an asset
   * DELETE /tenant?assetId=...
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAllTenants(@Req() req: any, @Query() query: AssetIdQueryDto) {
    const issuerId = req.user?.userId;
    const result =
      await this.assetTenantService.deleteAllAssetTenantsByAssetId(
        query.assetId,
        issuerId,
      );
    return {
      data: result,
      message: `Successfully deleted ${result.deletedCount} tenants for this asset`,
    };
  }
}

