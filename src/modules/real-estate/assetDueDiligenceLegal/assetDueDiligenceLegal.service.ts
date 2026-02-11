import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetDueDiligenceLegal,
  AssetDueDiligenceLegalDocument,
} from '../schema/assetDueDiligenceLegal.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateDueDiligenceLegalDto } from './dto/create-due-diligence-legal.dto';
import { UpdateDueDiligenceLegalDto } from './dto/update-due-diligence-legal.dto';

@Injectable()
export class AssetDueDiligenceLegalService {
  constructor(
    @InjectModel(AssetDueDiligenceLegal.name)
    private readonly dueDiligenceLegalModel: Model<AssetDueDiligenceLegalDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new due diligence legal entry for an asset.
   * Ensures the asset exists, belongs to the issuer, and no duplicate due diligence legal name exists.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateDueDiligenceLegalDto} createDto - Data for the new due diligence legal.
   * @returns {Promise<AssetDueDiligenceLegalDocument>} The created due diligence legal document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate due diligence legal name exists.
   */
  async createDueDiligenceLegal(
    assetId: string,
    issuerId: string,
    createDto: CreateDueDiligenceLegalDto,
  ): Promise<AssetDueDiligenceLegalDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if due diligence legal with same name already exists for this asset
    const existingDueDiligenceLegal = await this.dueDiligenceLegalModel.findOne(
      {
        assetId,
        issuerId,
        name: createDto.name,
      },
    );

    if (existingDueDiligenceLegal) {
      throw new ConflictException(
        `A due diligence legal with the name "${createDto.name}" already exists for this asset`,
      );
    }

    // Create new asset due diligence legal
    const dueDiligenceLegal = new this.dueDiligenceLegalModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await dueDiligenceLegal.save();
  }

  /**
   * Retrieves a due diligence legal entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceLegalId - The ID of the due diligence legal entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceLegalDocument>} The retrieved due diligence legal document.
   * @throws {NotFoundException} If due diligence legal not found or doesn't belong to issuer.
   */
  async getDueDiligenceLegalById(
    dueDiligenceLegalId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceLegalDocument> {
    const dueDiligenceLegal = await this.dueDiligenceLegalModel.findOne({
      _id: dueDiligenceLegalId,
      issuerId,
    });

    if (!dueDiligenceLegal) {
      throw new NotFoundException(
        'Due diligence legal not found or does not belong to this issuer',
      );
    }

    return dueDiligenceLegal;
  }

  /**
   * Updates a due diligence legal entry by its ID.
   * Checks for duplicate name before update and ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceLegalId - The ID of the due diligence legal entry.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateDueDiligenceLegalDto} updateDto - The data to update.
   * @returns {Promise<AssetDueDiligenceLegalDocument>} The updated due diligence legal document.
   * @throws {NotFoundException} If due diligence legal not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateDueDiligenceLegal(
    dueDiligenceLegalId: string,
    issuerId: string,
    updateDto: UpdateDueDiligenceLegalDto,
  ): Promise<AssetDueDiligenceLegalDocument> {
    // First get the current due diligence legal
    const currentDueDiligenceLegal = await this.dueDiligenceLegalModel.findOne({
      _id: dueDiligenceLegalId,
      issuerId,
    });

    if (!currentDueDiligenceLegal) {
      throw new NotFoundException(
        'Due diligence legal not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingDueDiligenceLegal =
        await this.dueDiligenceLegalModel.findOne({
          assetId: currentDueDiligenceLegal.assetId,
          issuerId,
          name: updateDto.name,
          _id: { $ne: dueDiligenceLegalId },
        });

      if (existingDueDiligenceLegal) {
        throw new ConflictException(
          `A due diligence legal with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const dueDiligenceLegal =
      await this.dueDiligenceLegalModel.findOneAndUpdate(
        { _id: dueDiligenceLegalId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!dueDiligenceLegal) {
      throw new NotFoundException(
        'Due diligence legal not found or does not belong to this issuer',
      );
    }

    return dueDiligenceLegal;
  }

  /**
   * Retrieves all due diligence legal entries for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDueDiligenceLegalDocument[]>} List of due diligence legal documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAllDueDiligenceLegalsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetDueDiligenceLegalDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.dueDiligenceLegalModel.find({ assetId, issuerId });
  }

  /**
   * Deletes a due diligence legal entry by its ID.
   * Ensures the entry belongs to the issuer.
   * @param {string} dueDiligenceLegalId - The ID of the due diligence legal entry.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<{ deleted: boolean }>} Whether the deletion was successful.
   * @throws {NotFoundException} If due diligence legal not found or doesn't belong to issuer.
   */
  async deleteDueDiligenceLegal(
    dueDiligenceLegalId: string,
    issuerId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.dueDiligenceLegalModel.deleteOne({
      _id: dueDiligenceLegalId,
      issuerId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Due diligence legal not found or does not belong to this issuer',
      );
    }

    return { deleted: true };
  }
}

