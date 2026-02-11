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
import { AmenityService } from './amenity.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import {
  AssetIdQueryDto,
  AmenityIdParamDto,
} from './dto/amenity-query.dto';
import { JwtAuthGuard } from '../../auth_issuer/guards/jwt-auth.guard';

@Controller('amenity')
@UseGuards(JwtAuthGuard)
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  /**
   * Create a new asset amenity
   * POST /amenity?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetAmenity(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAmenityDto,
  ) {
    const issuerId = req.user?.userId;
    const newAmenity = await this.amenityService.createAssetAmenity(
      query.assetId,
      issuerId,
      createDto,
    );

    return {
      data: newAmenity,
      message: 'Asset amenity created successfully',
    };
  }

  /**
   * Get all amenities for an asset
   * GET /amenity/asset?assetId=...
   */
  @Get('asset')
  @HttpCode(HttpStatus.OK)
  async getAllAssetAmenities(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const amenities = await this.amenityService.getAllAssetAmenities(
      query.assetId,
      issuerId,
    );

    return {
      data: amenities,
      message: 'Asset amenities retrieved successfully',
    };
  }

  /**
   * Update an asset amenity
   * PUT /amenity/:amenityId
   */
  @Put(':amenityId')
  @HttpCode(HttpStatus.OK)
  async updateAssetAmenity(
    @Req() req: any,
    @Param() params: AmenityIdParamDto,
    @Body() updateDto: UpdateAmenityDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedAmenity = await this.amenityService.updateAssetAmenity(
      params.amenityId,
      issuerId,
      updateDto,
    );

    return {
      data: updatedAmenity,
      message: 'Asset amenity updated successfully',
    };
  }

  /**
   * Delete an asset amenity
   * DELETE /amenity/:amenityId
   */
  @Delete(':amenityId')
  @HttpCode(HttpStatus.OK)
  async deleteAssetAmenity(
    @Req() req: any,
    @Param() params: AmenityIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const deletedAmenity = await this.amenityService.deleteAssetAmenity(
      params.amenityId,
      issuerId,
    );

    return {
      data: deletedAmenity,
      message: 'Asset amenity deleted successfully',
    };
  }
}

