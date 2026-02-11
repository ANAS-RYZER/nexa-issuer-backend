import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ExitOpportunity,
  ExitOpportunityDocument,
} from '../schema/assetExitOpportunity.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateExitOpportunityDto } from './dto/create-exit-opportunity.dto';
import { UpdateExitOpportunityDto } from './dto/update-exit-opportunity.dto';

@Injectable()
export class AssetExitOpportunityService {
  constructor(
    @InjectModel(ExitOpportunity.name)
    private readonly exitOpportunityModel: Model<ExitOpportunityDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new exit opportunity for an asset.
   * Ensures the asset exists, belongs to the issuer, and that no duplicate exit opportunity name exists for the asset.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateExitOpportunityDto} createDto - The exit opportunity data.
   * @returns {Promise<ExitOpportunityDocument>} The created exit opportunity document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate exit opportunity name exists.
   */
  async createExitOpportunity(
    assetId: string,
    issuerId: string,
    createDto: CreateExitOpportunityDto,
  ): Promise<ExitOpportunityDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if exit opportunity with same name already exists for this asset
    const existingExitOpportunity = await this.exitOpportunityModel.findOne({
      assetId,
      issuerId,
      name: createDto.name,
    });

    if (existingExitOpportunity) {
      throw new ConflictException(
        `An exit opportunity with the name "${createDto.name}" already exists for this asset`,
      );
    }

    const newExitOpportunity = new this.exitOpportunityModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newExitOpportunity.save();
  }

  /**
   * Retrieves all exit opportunities for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<ExitOpportunityDocument[]>} List of exit opportunity documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getExitOpportunitiesByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<ExitOpportunityDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.exitOpportunityModel.find({ assetId, issuerId });
  }

  /**
   * Updates an exit opportunity by its ID.
   * Checks for duplicate name before update and ensures the entry belongs to the issuer.
   * @param {string} exitOpportunityId - The ID of the exit opportunity.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateExitOpportunityDto} updateDto - The data to update.
   * @returns {Promise<ExitOpportunityDocument>} The updated exit opportunity document.
   * @throws {NotFoundException} If exit opportunity not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateExitOpportunity(
    exitOpportunityId: string,
    issuerId: string,
    updateDto: UpdateExitOpportunityDto,
  ): Promise<ExitOpportunityDocument> {
    // First get the current exit opportunity
    const currentExitOpportunity = await this.exitOpportunityModel.findOne({
      _id: exitOpportunityId,
      issuerId,
    });

    if (!currentExitOpportunity) {
      throw new NotFoundException(
        'Exit opportunity not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingExitOpportunity = await this.exitOpportunityModel.findOne({
        assetId: currentExitOpportunity.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: exitOpportunityId },
      });

      if (existingExitOpportunity) {
        throw new ConflictException(
          `An exit opportunity with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedExitOpportunity =
      await this.exitOpportunityModel.findOneAndUpdate(
        { _id: exitOpportunityId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!updatedExitOpportunity) {
      throw new NotFoundException(
        'Exit opportunity not found or does not belong to this issuer',
      );
    }

    return updatedExitOpportunity;
  }

  /**
   * Deletes an exit opportunity by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} exitOpportunityId - The ID of the exit opportunity.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<ExitOpportunityDocument>} The deleted exit opportunity document.
   * @throws {NotFoundException} If exit opportunity not found or doesn't belong to issuer.
   */
  async deleteExitOpportunity(
    exitOpportunityId: string,
    issuerId: string,
  ): Promise<ExitOpportunityDocument> {
    const deletedExitOpportunity =
      await this.exitOpportunityModel.findOneAndDelete({
        _id: exitOpportunityId,
        issuerId,
      });

    if (!deletedExitOpportunity) {
      throw new NotFoundException(
        'Exit opportunity not found or does not belong to this issuer',
      );
    }

    return deletedExitOpportunity;
  }
}

