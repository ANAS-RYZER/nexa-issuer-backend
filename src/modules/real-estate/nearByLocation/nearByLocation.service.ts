import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import {
  NearByLocation,
  NearByLocationDocument,
  LocationType,
} from '../schema/nearByLocation.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import {
  CreateNearByLocationDto,
  CreateNearByLocationItemDto,
} from './dto/create-nearby-location.dto';
import { UpdateNearByLocationDto } from './dto/update-nearby-location.dto';
import { calculateDistanceKm } from './utils/calculateDistanceKm';
import { groupPlacesByType, Place } from './utils/groupPlacesByType';

// Google Places API Response types
interface GooglePlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

interface GooglePlace {
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: GooglePlaceGeometry;
}

interface GooglePlacesResponse {
  results?: GooglePlace[];
  status?: string;
  error_message?: string;
}

@Injectable()
export class NearByLocationService {
  constructor(
    @InjectModel(NearByLocation.name)
    private readonly nearByLocationModel: Model<NearByLocationDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates new nearby locations for assets.
   * Validates input data, asset existence, location type, and uniqueness of location name per asset and type.
   */
  async createNearByLocation(
    assetId: string,
    createDto: CreateNearByLocationDto,
  ): Promise<NearByLocationDocument[]> {
    const locationData = createDto.locations;

    // Check if location data is provided
    if (!locationData || locationData.length === 0) {
      throw new BadRequestException('No location data provided');
    }

    // Check if asset exists
    const asset = await this.assetModel.findOne({ _id: assetId });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Validate each location entry
    for (const location of locationData) {
      // Check for duplicate names for the same asset and locationType
      const existingLocation = await this.nearByLocationModel.findOne({
        assetId,
        locationType: location.locationType,
        name: location.name,
      });

      if (existingLocation) {
        throw new ConflictException(
          `A nearby location with the name "${location.name}" already exists for this asset and location type`,
        );
      }
    }

    // Prepare data for insertion
    const locationsToInsert = locationData.map((location) => ({
      ...location,
      assetId,
      issuerId: asset.issuerId,
      isActive: location.isActive ?? true,
    }));

    const newLocationData = await this.nearByLocationModel.insertMany(
      locationsToInsert,
      { ordered: false },
    );

    return newLocationData;
  }

  /**
   * Retrieves and groups nearby locations by type for a given asset.
   */
  async getNearByLocationByPropertyId(
    assetId: string,
  ): Promise<Record<string, Place[]>> {
    // Check if asset exists
    const asset = await this.assetModel.findOne({ _id: assetId });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const locations = await this.nearByLocationModel.find({ assetId }).lean();

    if (locations.length === 0) {
      return {};
    }

    // Convert Mongoose documents to Place objects
    const places: Place[] = locations.map((loc) => ({
      assetId: loc.assetId.toString(),
      name: loc.name,
      address: loc.address,
      distanceInKm: loc.distanceInKm,
      locationType: loc.locationType,
      isActive: loc.isActive,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    return groupPlacesByType(places);
  }

  /**
   * Updates the active status of a nearby location.
   */
  async updateNearByLocationIsActive(
    id: string,
    isActive: boolean,
  ): Promise<NearByLocationDocument> {
    if (isActive === undefined || isActive === null) {
      throw new BadRequestException('isActive status is required');
    }

    const updatedLocationData =
      await this.nearByLocationModel.findOneAndUpdate(
        { _id: id },
        { $set: { isActive } },
        { new: true },
      );

    if (!updatedLocationData) {
      throw new NotFoundException('Nearby location not found');
    }

    return updatedLocationData;
  }

  /**
   * Updates nearby location data by ID.
   */
  async updateNearByLocation(
    id: string,
    updateDto: UpdateNearByLocationDto,
  ): Promise<NearByLocationDocument> {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      throw new BadRequestException('Update data is required');
    }

    // Get the current location to check if it exists
    const currentLocation = await this.nearByLocationModel.findOne({
      _id: id,
    });

    if (!currentLocation) {
      throw new NotFoundException('Nearby location not found');
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const locationType = updateDto.locationType || currentLocation.locationType;

      const existingLocation = await this.nearByLocationModel.findOne({
        assetId: currentLocation.assetId,
        locationType: locationType,
        name: updateDto.name,
        _id: { $ne: id },
      });

      if (existingLocation) {
        throw new ConflictException(
          `A nearby location with the name "${updateDto.name}" already exists for this asset and location type`,
        );
      }
    }

    const updatedLocationData =
      await this.nearByLocationModel.findOneAndUpdate(
        { _id: id },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!updatedLocationData) {
      throw new NotFoundException('Nearby location not found');
    }

    return updatedLocationData;
  }

  /**
   * Deletes a nearby location by ID.
   */
  async deleteNearByLocations(id: string): Promise<NearByLocationDocument> {
    const deletedLocationData =
      await this.nearByLocationModel.findOneAndDelete({ _id: id });

    if (!deletedLocationData) {
      throw new NotFoundException('Nearby location not found');
    }

    return deletedLocationData;
  }

  /**
   * Fetches nearby places using Google Maps API based on latitude and longitude.
   * Saves results to DB after removing existing locations for the asset.
   */
  async getPlaces(
    lat: string,
    lng: string,
    assetId: string,
  ): Promise<Record<string, Place[]>> {
    // Input validation
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid latitude or longitude format');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    // Check if asset exists
    const asset = await this.assetModel.findOne({ _id: assetId });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Get API key
    const mapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!mapsApiKey) {
      throw new UnauthorizedException('Google Maps API key is not configured');
    }

    const BASE_URL =
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const types = Object.values(LocationType);
    const results: Place[] = [];

    // Fetch places by type
    for (const type of types) {
      const url = `${BASE_URL}?location=${latitude},${longitude}&radius=10000&type=${type}&key=${mapsApiKey}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new BadGatewayException(
            `Google Places API error: ${response.statusText}`,
          );
        }

        const data = (await response.json()) as GooglePlacesResponse;

        if (
          data.status &&
          data.status !== 'OK' &&
          data.status !== 'ZERO_RESULTS'
        ) {
          throw new BadGatewayException(
            `Google Places API error: ${data.status} - ${
              data.error_message || 'Unknown error'
            }`,
          );
        }

        const places = data.results || [];

        for (const place of places) {
          const placeLat = place?.geometry?.location.lat;
          const placeLng = place?.geometry?.location.lng;
          const address = place?.vicinity || place?.formatted_address;
          const name = place?.name;

          if (placeLat != null && placeLng != null && address && name) {
            const distanceInKm = calculateDistanceKm(
              latitude,
              longitude,
              placeLat,
              placeLng,
            );

            results.push({
              assetId,
              name,
              address,
              distanceInKm: parseFloat(distanceInKm.toFixed(2)),
              locationType: type,
              isActive: true,
              latitude: lat,
              longitude: lng,
            });
          }
        }
      } catch (error) {
        if (error instanceof BadGatewayException) {
          throw error;
        }
        throw new BadGatewayException(
          `Failed to fetch places from Google Maps API: ${error.message}`,
        );
      }
    }

    // Delete existing locations and insert new ones
    await this.nearByLocationModel.deleteMany({ assetId });

    const locationsToInsert = results.map((location) => ({
      ...location,
      issuerId: asset.issuerId,
    }));

    const insertedLocations = await this.nearByLocationModel.insertMany(
      locationsToInsert,
    );

    // Convert inserted documents to Place objects
    const places: Place[] = insertedLocations.map((loc) => ({
      assetId: loc.assetId.toString(),
      name: loc.name,
      address: loc.address,
      distanceInKm: loc.distanceInKm,
      locationType: loc.locationType,
      isActive: loc.isActive,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    // Group and return
    return groupPlacesByType(places);
  }
}

