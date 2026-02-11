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
import { AllocationCategoryService } from './allocationCategory.service';
import { CreateAllocationCategoryDto } from './dto/create-allocation-category.dto';
import { UpdateAllocationCategoryDto } from './dto/update-allocation-category.dto';
import {
  AssetIdQueryDto,
  AllocationIdParamDto,
} from './dto/allocation-category-query.dto';
import { JwtAuthGuard } from '../../auth_issuer/guards/jwt-auth.guard';

@Controller('allocation-category')
@UseGuards(JwtAuthGuard)
export class AllocationCategoryController {
  constructor(
    private readonly allocationCategoryService: AllocationCategoryService,
  ) {}

  /**
   * Create allocation category
   * POST /allocation-category?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAllocationCategory(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAllocationCategoryDto,
  ) {
    const issuerId = req.user?.userId;
    const allocation =
      await this.allocationCategoryService.createAllocationCategory(
        query.assetId,
        issuerId,
        createDto,
      );

    return {
      data: allocation,
      message: 'Allocation category created successfully',
    };
  }

  /**
   * Get all allocations by asset ID
   * GET /allocation-category/asset?assetId=...
   */
  @Get('asset')
  @HttpCode(HttpStatus.OK)
  async getAllocationsByAssetId(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const allocations =
      await this.allocationCategoryService.getAllocationsByAssetId(
        query.assetId,
        issuerId,
      );

    return {
      data: allocations,
      message: 'Allocations retrieved successfully',
    };
  }

  /**
   * Get allocation statistics
   * GET /allocation-category/stats?assetId=...
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getAllocationStats(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const stats = await this.allocationCategoryService.getAllocationStats(
      query.assetId,
      issuerId,
    );

    return {
      data: stats,
      message: 'Allocation statistics retrieved successfully',
    };
  }

  /**
   * Update allocation category
   * PUT /allocation-category/:allocationId
   */
  @Put(':allocationId')
  @HttpCode(HttpStatus.OK)
  async updateAllocationCategory(
    @Req() req: any,
    @Param() params: AllocationIdParamDto,
    @Body() updateDto: UpdateAllocationCategoryDto,
  ) {
    const issuerId = req.user?.userId;
    const allocation =
      await this.allocationCategoryService.updateAllocationCategory(
        params.allocationId,
        issuerId,
        updateDto,
      );

    return {
      data: allocation,
      message: 'Allocation category updated successfully',
    };
  }

  /**
   * Delete allocation category
   * DELETE /allocation-category/:allocationId
   */
  @Delete(':allocationId')
  @HttpCode(HttpStatus.OK)
  async deleteAllocationCategory(
    @Req() req: any,
    @Param() params: AllocationIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const result =
      await this.allocationCategoryService.deleteAllocationCategory(
        params.allocationId,
        issuerId,
      );

    return {
      data: result,
      message: 'Allocation category deleted successfully',
    };
  }
}

