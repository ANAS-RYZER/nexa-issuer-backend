import {
  Controller,
  HttpCode,
  Post,
  Get,
  Put,
  Delete,
  HttpStatus,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { NearByLocationService } from './nearByLocation.service';
import {
  CreateNearByLocationDto,
  UpdateNearByLocationDto,
  AssetIdQueryDto,
  LocationIdParamsDto,
  GetPlacesQueryDto,
} from './dto';

@Controller('nearByLocation')
export class NearByLocationController {
  constructor(
    private readonly nearByLocationService: NearByLocationService,
  ) {}

  /**
   * Create new nearby locations
   * POST /nearByLocation?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNearByLocation(
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateNearByLocationDto,
  ) {
    const newLocationData =
      await this.nearByLocationService.createNearByLocation(
        query.assetId,
        createDto,
      );
    return {
      data: newLocationData,
      message: 'Near by locations created successfully',
    };
  }

  /**
   * Fetch places from Google Maps API
   * GET /nearByLocation/places?lat=...&lng=...&assetId=...
   * NOTE: This must be defined before the /:id route to avoid conflicts
   */
  @Get('places')
  @HttpCode(HttpStatus.OK)
  async getPlaces(@Query() query: GetPlacesQueryDto) {
    const allPlaces = await this.nearByLocationService.getPlaces(
      query.lat,
      query.lng,
      query.assetId,
    );
    return {
      data: allPlaces,
      message: 'Places retrieved successfully',
    };
  }

  /**
   * Get all nearby locations for an asset
   * GET /nearByLocation?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllNearByLocations(@Query() query: AssetIdQueryDto) {
    const locations =
      await this.nearByLocationService.getNearByLocationByPropertyId(
        query.assetId,
      );
    return {
      data: locations,
      message: 'Near by Locations by id retrieved successfully',
    };
  }

  /**
   * Update a nearby location (isActive status)
   * PUT /nearByLocation/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateNearByLocation(
    @Param() params: LocationIdParamsDto,
    @Body() updateDto: UpdateNearByLocationDto,
  ) {
    // If only isActive is provided, use the simpler update method
    if (
      updateDto.isActive !== undefined &&
      Object.keys(updateDto).length === 1
    ) {
      const updatedLocation =
        await this.nearByLocationService.updateNearByLocationIsActive(
          params.id,
          updateDto.isActive,
        );
      return {
        data: updatedLocation,
        message: 'Near by location updated successfully',
      };
    }

    // Otherwise use the full update method
    const updatedLocation =
      await this.nearByLocationService.updateNearByLocation(
        params.id,
        updateDto,
      );
    return {
      data: updatedLocation,
      message: 'Near by location updated successfully',
    };
  }

  /**
   * Delete a nearby location
   * DELETE /nearByLocation/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNearByLocation(@Param() params: LocationIdParamsDto) {
    const deletedLocation =
      await this.nearByLocationService.deleteNearByLocations(params.id);
    return {
      data: deletedLocation,
      message: 'Near by location deleted successfully',
    };
  }
}


