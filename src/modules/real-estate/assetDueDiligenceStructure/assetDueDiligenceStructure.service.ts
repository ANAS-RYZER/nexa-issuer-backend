import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetDueDiligenceStructure,
  AssetDueDiligenceStructureDocument,
} from '../schema/assetDueDiligenceStructure.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateDueDiligenceStructureDto } from './dto/create-due-diligence-structure.dto';
import { UpdateDueDiligenceStructureDto } from './dto/update-due-diligence-structure.dto';

@Injectable()
export class AssetDueDiligenceStructureService {
  constructor(
    @InjectModel(AssetDueDiligenceStructure.name)
    private readonly dueDiligenceStructureModel: Model<AssetDueDiligenceStructureDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new due diligence structure for an asset.
   * Ensures the asset exists, belongs to the issuer, and no duplicate due diligence structure name exists for the asset.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateDueDiligenceStructureDto} createDto - Data for the new due diligence structure.
   * @returns {Promise<AssetDueDiligenceStructureDocument>} The created due diligence structure document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate due diligence structure name exists.
   */
  async createDueDiligenceStructure(
    assetId: string,
    issuerId: string,
    createDto: CreateDueDiligenceStructureDto,
  ): Promise<AssetDueDiligenceStructureDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if due diligence structure with same name already exists for this asset
    const existingDueDiligenceStructure =
      await this.dueDiligenceStructureModel.findOne({
        assetId,
        issuerId,
        name: createDto.name,
      });

    if (existingDueDiligenceStructure) {
      throw new ConflictException(
        `A due diligence structure with the name "${createDto.name}" already exists for this asset`,
      );
    }

    // Create new asset due diligence structure
    const dueDiligenceStructure = new this.dueDiligenceStructureModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await dueDiligenceStructure.save();
  }

  /**
   * Retrieves a due diligence structure entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceStructureId - The ID of the due diligence structure entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceStructureDocument>} The retrieved due diligence structure document.
   * @throws {NotFoundException} If due diligence structure not found or doesn't belong to issuer.
   */
  async getDueDiligenceStructureById(
    dueDiligenceStructureId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceStructureDocument> {
    const dueDiligenceStructure =
      await this.dueDiligenceStructureModel.findOne({
        _id: dueDiligenceStructureId,
        issuerId,
      });

    if (!dueDiligenceStructure) {
      throw new NotFoundException(
        'Due diligence structure not found or does not belong to this issuer',
      );
    }

    return dueDiligenceStructure;
  }

  /**
   * Updates a due diligence structure entry by its ID.
   * Checks for duplicate name before update and ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceStructureId - The ID of the due diligence structure entry.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateDueDiligenceStructureDto} updateDto - The data to update.
   * @returns {Promise<AssetDueDiligenceStructureDocument>} The updated due diligence structure document.
   * @throws {NotFoundException} If due diligence structure not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateDueDiligenceStructure(
    dueDiligenceStructureId: string,
    issuerId: string,
    updateDto: UpdateDueDiligenceStructureDto,
  ): Promise<AssetDueDiligenceStructureDocument> {
    // First get the current due diligence structure
    const currentDueDiligenceStructure =
      await this.dueDiligenceStructureModel.findOne({
        _id: dueDiligenceStructureId,
        issuerId,
      });

    if (!currentDueDiligenceStructure) {
      throw new NotFoundException(
        'Due diligence structure not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingDueDiligenceStructure =
        await this.dueDiligenceStructureModel.findOne({
          assetId: currentDueDiligenceStructure.assetId,
          issuerId,
          name: updateDto.name,
          _id: { $ne: dueDiligenceStructureId },
        });

      if (existingDueDiligenceStructure) {
        throw new ConflictException(
          `A due diligence structure with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const dueDiligenceStructure =
      await this.dueDiligenceStructureModel.findOneAndUpdate(
        { _id: dueDiligenceStructureId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!dueDiligenceStructure) {
      throw new NotFoundException(
        'Due diligence structure not found or does not belong to this issuer',
      );
    }

    return dueDiligenceStructure;
  }

  /**
   * Retrieves all due diligence structure entries for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceStructureDocument[]>} List of due diligence structure documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAllDueDiligenceStructuresByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceStructureDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.dueDiligenceStructureModel.find({ assetId, issuerId });
  }

  /**
   * Deletes a due diligence structure entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceStructureId - The ID of the due diligence structure entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<{ deleted: boolean }>} Whether the deletion was successful.
   * @throws {NotFoundException} If due diligence structure not found or doesn't belong to issuer.
   */
  async deleteDueDiligenceStructure(
    dueDiligenceStructureId: string,
    issuerId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.dueDiligenceStructureModel.deleteOne({
      _id: dueDiligenceStructureId,
      issuerId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Due diligence structure not found or does not belong to this issuer',
      );
    }

    return { deleted: true };
  }
}

