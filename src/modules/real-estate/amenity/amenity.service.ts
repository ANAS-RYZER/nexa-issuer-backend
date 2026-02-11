import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AssetAmenity,
  AssetAmenityDocument,
} from '../schema/assetAmenity.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenityService {
  constructor(
    @InjectModel(AssetAmenity.name)
    private readonly amenityModel: Model<AssetAmenityDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Create a new amenity for a specific asset.
   * Ensures asset exists before creating the amenity.
   */
  async createAssetAmenity(
    assetId: string,
    issuerId: string,
    amenityDto: CreateAmenityDto,
  ): Promise<AssetAmenityDocument> {
    if (!assetId) {
      throw new BadRequestException('Asset ID is required');
    }

    // Check if asset exists and belongs to issuer
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Optional: Check for duplicate amenity name (commented out in original)
    // const existingAmenity = await this.amenityModel.findOne({
    //   assetId,
    //   issuerId,
    //   name: amenityDto.name,
    // });
    //
    // if (existingAmenity) {
    //   throw new ConflictException(
    //     `An amenity with the name "${amenityDto.name}" already exists for this asset`,
    //   );
    // }

    const newAmenity = new this.amenityModel({
      assetId: new Types.ObjectId(assetId),
      issuerId: new Types.ObjectId(issuerId),
      ...amenityDto,
    });

    return await newAmenity.save();
  }

  /**
   * Retrieve all amenities for a specific asset.
   * Note: Global amenity sync is commented out as GlobalAmenityService is not available
   */
  async getAllAssetAmenities(
    assetId: string,
    issuerId: string,
  ): Promise<AssetAmenityDocument[]> {
    if (!assetId) {
      throw new BadRequestException('Asset ID is required');
    }

    // Verify asset exists and belongs to issuer
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Get all amenities for this asset
    const existingAmenities = await this.amenityModel.find({
      assetId,
      issuerId,
    });

    // TODO: Implement global amenity sync when GlobalAmenityService is available
    // if (existingAmenities.length === 0) {
    //   // Sync from global amenities based on asset class and category
    //   const globalAmenities = await GlobalAmenityServices.getGlobalAmenitiesByCategoryAndClass(
    //     asset.category,
    //     asset.class
    //   );
    //   // Insert and return
    // }

    return existingAmenities;
  }

  /**
   * Update an existing amenity for an asset (issuerId filter applied).
   * Ensures no duplicate amenity name exists for the same asset.
   */
  async updateAssetAmenity(
    amenityId: string,
    issuerId: string,
    updateDto: UpdateAmenityDto,
  ): Promise<AssetAmenityDocument> {
    if (!amenityId) {
      throw new BadRequestException('Amenity ID is required');
    }

    // Get current amenity
    const currentAmenity = await this.amenityModel.findOne({
      _id: amenityId,
      issuerId: issuerId,
    });

    if (!currentAmenity) {
      throw new NotFoundException('Amenity not found');
    }

    // Check for duplicate name if name is being updated
    if (updateDto.name && updateDto.name !== currentAmenity.name) {
      const existingAmenity = await this.amenityModel.findOne({
        assetId: currentAmenity.assetId,
        issuerId: issuerId,
        name: updateDto.name,
        _id: { $ne: amenityId },
      });

      if (existingAmenity) {
        throw new ConflictException(
          `An amenity with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedAmenity = await this.amenityModel.findOneAndUpdate(
      { _id: amenityId, issuerId: issuerId },
      { ...updateDto },
      { new: true, runValidators: true },
    );

    if (!updatedAmenity) {
      throw new NotFoundException('Amenity not found');
    }

    return updatedAmenity;
  }

  /**
   * Delete an amenity by ID (issuerId filter applied).
   */
  async deleteAssetAmenity(
    amenityId: string,
    issuerId: string,
  ): Promise<AssetAmenityDocument> {
    if (!amenityId) {
      throw new BadRequestException('Amenity ID is required');
    }

    const deletedAmenity = await this.amenityModel.findOneAndDelete({
      _id: amenityId,
      issuerId: issuerId,
    });

    if (!deletedAmenity) {
      throw new NotFoundException('Amenity not found');
    }

    return deletedAmenity;
  }
}

