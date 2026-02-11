import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetFeature,
  AssetFeatureDocument,
} from '../schema/assetFeature.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateAssetFeatureDto } from './dto/create-asset-feature.dto';
import { UpdateAssetFeatureDto } from './dto/update-asset-feature.dto';

@Injectable()
export class AssetFeatureService {
  constructor(
    @InjectModel(AssetFeature.name)
    private readonly assetFeatureModel: Model<AssetFeatureDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new asset feature.
   * Validates asset existence and issuer ownership before saving.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateAssetFeatureDto} createDto - The feature data including name, description, image, and status.
   * @returns {Promise<AssetFeatureDocument>} The created feature document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async createAssetFeature(
    assetId: string,
    issuerId: string,
    createDto: CreateAssetFeatureDto,
  ): Promise<AssetFeatureDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    const newFeature = new this.assetFeatureModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newFeature.save();
  }

  /**
   * Retrieves all features for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetFeatureDocument[]>} List of asset feature documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAllAssetFeatures(
    assetId: string,
    issuerId: string,
  ): Promise<AssetFeatureDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.assetFeatureModel.find({ assetId, issuerId });
  }

  /**
   * Updates an asset feature by its ID.
   * Validates existence, issuer ownership, and duplicate name before updating.
   * @param {string} featureId - The ID of the feature.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateAssetFeatureDto} updateDto - Data to update (name, description, etc).
   * @returns {Promise<AssetFeatureDocument>} The updated feature document.
   * @throws {NotFoundException} If feature not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateAssetFeature(
    featureId: string,
    issuerId: string,
    updateDto: UpdateAssetFeatureDto,
  ): Promise<AssetFeatureDocument> {
    // First get the current feature to check whether it exists
    const currentFeature = await this.assetFeatureModel.findOne({
      _id: featureId,
      issuerId,
    });

    if (!currentFeature) {
      throw new NotFoundException(
        'Feature not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingFeature = await this.assetFeatureModel.findOne({
        assetId: currentFeature.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: featureId },
      });

      if (existingFeature) {
        throw new ConflictException(
          `A feature with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedFeature = await this.assetFeatureModel.findOneAndUpdate(
      { _id: featureId, issuerId },
      updateDto,
      { new: true, runValidators: true },
    );

    if (!updatedFeature) {
      throw new NotFoundException(
        'Feature not found or does not belong to this issuer',
      );
    }

    return updatedFeature;
  }

  /**
   * Deletes an asset feature by its ID.
   * Ensures the feature belongs to the issuer.
   * @param {string} featureId - The ID of the feature.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetFeatureDocument>} The deleted feature document.
   * @throws {NotFoundException} If feature not found or doesn't belong to issuer.
   */
  async deleteAssetFeature(
    featureId: string,
    issuerId: string,
  ): Promise<AssetFeatureDocument> {
    const deletedFeature = await this.assetFeatureModel.findOneAndDelete({
      _id: featureId,
      issuerId,
    });

    if (!deletedFeature) {
      throw new NotFoundException(
        'Feature not found or does not belong to this issuer',
      );
    }

    return deletedFeature;
  }
}

