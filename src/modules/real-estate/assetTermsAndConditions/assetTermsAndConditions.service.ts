import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetTermsAndConditions,
  AssetTermsAndConditionsDocument,
} from '../schema/assetTermsAndConditions.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';
import { UpdateTermsAndConditionsDto } from './dto/update-terms-and-conditions.dto';

@Injectable()
export class AssetTermsAndConditionsService {
  constructor(
    @InjectModel(AssetTermsAndConditions.name)
    private readonly termsAndConditionsModel: Model<AssetTermsAndConditionsDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates new terms and conditions for an asset.
   * Validates asset existence, issuer ownership, and ensures no duplicate terms with the same title exists for the asset.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateTermsAndConditionsDto} createDto - The terms and conditions data.
   * @returns {Promise<AssetTermsAndConditionsDocument>} The created terms and conditions document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate terms exist.
   */
  async createAssetTermsAndConditions(
    assetId: string,
    issuerId: string,
    createDto: CreateTermsAndConditionsDto,
  ): Promise<AssetTermsAndConditionsDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if terms with same title already exists for this asset
    const existingTAndC = await this.termsAndConditionsModel.findOne({
      assetId,
      issuerId,
      title: createDto.title,
    });

    if (existingTAndC) {
      throw new ConflictException(
        `Terms and conditions with the title "${createDto.title}" already exists for this asset`,
      );
    }

    const newTermsAndConditions = new this.termsAndConditionsModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newTermsAndConditions.save();
  }

  /**
   * Retrieves all terms and conditions for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetTermsAndConditionsDocument[]>} List of terms and conditions for the asset.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAssetTermsAndConditionsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetTermsAndConditionsDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.termsAndConditionsModel.find({ assetId, issuerId });
  }

  /**
   * Updates terms and conditions by its ID.
   * Validates existence, issuer ownership, and checks for duplicate title before updating.
   * @param {string} termsId - The terms and conditions ID.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateTermsAndConditionsDto} updateDto - Data to update.
   * @returns {Promise<AssetTermsAndConditionsDocument>} The updated terms and conditions document.
   * @throws {NotFoundException} If terms not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate title exists.
   */
  async updateAssetTermsAndConditions(
    termsId: string,
    issuerId: string,
    updateDto: UpdateTermsAndConditionsDto,
  ): Promise<AssetTermsAndConditionsDocument> {
    // First get the current terms and conditions to check whether it exists
    const currentTermsAndConditions =
      await this.termsAndConditionsModel.findOne({
        _id: termsId,
        issuerId,
      });

    if (!currentTermsAndConditions) {
      throw new NotFoundException(
        'Terms and conditions not found or does not belong to this issuer',
      );
    }

    // If title is being updated, check for duplicates
    if (updateDto.title) {
      const existingTermsAndConditions =
        await this.termsAndConditionsModel.findOne({
          assetId: currentTermsAndConditions.assetId,
          issuerId,
          title: updateDto.title,
          _id: { $ne: termsId },
        });

      if (existingTermsAndConditions) {
        throw new ConflictException(
          `Terms and conditions with the title "${updateDto.title}" already exists for this asset`,
        );
      }
    }

    const updatedTermsAndConditions =
      await this.termsAndConditionsModel.findOneAndUpdate(
        { _id: termsId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!updatedTermsAndConditions) {
      throw new NotFoundException(
        'Terms and conditions not found or does not belong to this issuer',
      );
    }

    return updatedTermsAndConditions;
  }

  /**
   * Deletes terms and conditions by its ID.
   * Ensures the terms belong to the issuer.
   * @param {string} termsId - The terms and conditions ID.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetTermsAndConditionsDocument>} The deleted terms and conditions document.
   * @throws {NotFoundException} If terms not found or doesn't belong to issuer.
   */
  async deleteAssetTermsAndConditions(
    termsId: string,
    issuerId: string,
  ): Promise<AssetTermsAndConditionsDocument> {
    const deletedTermsAndConditions =
      await this.termsAndConditionsModel.findOneAndDelete({
        _id: termsId,
        issuerId,
      });

    if (!deletedTermsAndConditions) {
      throw new NotFoundException(
        'Terms and conditions not found or does not belong to this issuer',
      );
    }

    return deletedTermsAndConditions;
  }
}

