import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetDueDiligenceValuation,
  AssetDueDiligenceValuationDocument,
} from '../schema/assetDueDiligenceValuation.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateDueDiligenceValuationDto } from './dto/create-due-diligence-valuation.dto';
import { UpdateDueDiligenceValuationDto } from './dto/update-due-diligence-valuation.dto';

@Injectable()
export class AssetDueDiligenceValuationService {
  constructor(
    @InjectModel(AssetDueDiligenceValuation.name)
    private readonly dueDiligenceValuationModel: Model<AssetDueDiligenceValuationDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new due diligence valuation for an asset.
   * Ensures the asset exists, belongs to the issuer, and no duplicate due diligence valuation name exists for the asset.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateDueDiligenceValuationDto} createDto - Data for the new due diligence valuation.
   * @returns {Promise<AssetDueDiligenceValuationDocument>} The created due diligence valuation document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate due diligence valuation name exists.
   */
  async createDueDiligenceValuation(
    assetId: string,
    issuerId: string,
    createDto: CreateDueDiligenceValuationDto,
  ): Promise<AssetDueDiligenceValuationDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if due diligence valuation with same name already exists for this asset
    const existingDueDiligenceValuation =
      await this.dueDiligenceValuationModel.findOne({
        assetId,
        issuerId,
        name: createDto.name,
      });

    if (existingDueDiligenceValuation) {
      throw new ConflictException(
        `A due diligence valuation with the name "${createDto.name}" already exists for this asset`,
      );
    }

    // Create new asset due diligence valuation
    const dueDiligenceValuation = new this.dueDiligenceValuationModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await dueDiligenceValuation.save();
  }

  /**
   * Retrieves a due diligence valuation entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceValuationId - The ID of the due diligence valuation entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceValuationDocument>} The retrieved due diligence valuation document.
   * @throws {NotFoundException} If due diligence valuation not found or doesn't belong to issuer.
   */
  async getDueDiligenceValuationById(
    dueDiligenceValuationId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceValuationDocument> {
    const dueDiligenceValuation =
      await this.dueDiligenceValuationModel.findOne({
        _id: dueDiligenceValuationId,
        issuerId,
      });

    if (!dueDiligenceValuation) {
      throw new NotFoundException(
        'Due diligence valuation not found or does not belong to this issuer',
      );
    }

    return dueDiligenceValuation;
  }

  /**
   * Updates a due diligence valuation entry by its ID.
   * Checks for duplicate name before update and ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceValuationId - The ID of the due diligence valuation entry.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateDueDiligenceValuationDto} updateDto - The data to update.
   * @returns {Promise<AssetDueDiligenceValuationDocument>} The updated due diligence valuation document.
   * @throws {NotFoundException} If due diligence valuation not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateDueDiligenceValuation(
    dueDiligenceValuationId: string,
    issuerId: string,
    updateDto: UpdateDueDiligenceValuationDto,
  ): Promise<AssetDueDiligenceValuationDocument> {
    // First get the current due diligence valuation
    const currentDueDiligenceValuation =
      await this.dueDiligenceValuationModel.findOne({
        _id: dueDiligenceValuationId,
        issuerId,
      });

    if (!currentDueDiligenceValuation) {
      throw new NotFoundException(
        'Due diligence valuation not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingDueDiligenceValuation =
        await this.dueDiligenceValuationModel.findOne({
          assetId: currentDueDiligenceValuation.assetId,
          issuerId,
          name: updateDto.name,
          _id: { $ne: dueDiligenceValuationId },
        });

      if (existingDueDiligenceValuation) {
        throw new ConflictException(
          `A due diligence valuation with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const dueDiligenceValuation =
      await this.dueDiligenceValuationModel.findOneAndUpdate(
        { _id: dueDiligenceValuationId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!dueDiligenceValuation) {
      throw new NotFoundException(
        'Due diligence valuation not found or does not belong to this issuer',
      );
    }

    return dueDiligenceValuation;
  }

  /**
   * Retrieves all due diligence valuation entries for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceValuationDocument[]>} List of due diligence valuation documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAllDueDiligenceValuationsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceValuationDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.dueDiligenceValuationModel.find({ assetId, issuerId });
  }

  /**
   * Deletes a due diligence valuation entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceValuationId - The ID of the due diligence valuation entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<{ deleted: boolean }>} Whether the deletion was successful.
   * @throws {NotFoundException} If due diligence valuation not found or doesn't belong to issuer.
   */
  async deleteDueDiligenceValuation(
    dueDiligenceValuationId: string,
    issuerId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.dueDiligenceValuationModel.deleteOne({
      _id: dueDiligenceValuationId,
      issuerId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Due diligence valuation not found or does not belong to this issuer',
      );
    }

    return { deleted: true };
  }
}

