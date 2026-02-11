import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RiskFactor,
  RiskFactorDocument,
} from '../schema/assetRiskFactor.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateRiskFactorDto } from './dto/create-risk-factor.dto';
import { UpdateRiskFactorDto } from './dto/update-risk-factor.dto';

@Injectable()
export class AssetRiskFactorService {
  constructor(
    @InjectModel(RiskFactor.name)
    private readonly riskFactorModel: Model<RiskFactorDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new risk factor for an asset.
   * Validates asset existence, issuer ownership, and ensures no duplicate risk factor with the same name exists for the asset.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateRiskFactorDto} createDto - The risk factor data (name, description).
   * @returns {Promise<RiskFactorDocument>} The created risk factor document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate risk factor exists.
   */
  async createRiskFactor(
    assetId: string,
    issuerId: string,
    createDto: CreateRiskFactorDto,
  ): Promise<RiskFactorDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if risk factor with same name already exists for this asset
    const existingRiskFactor = await this.riskFactorModel.findOne({
      assetId,
      issuerId,
      name: createDto.name,
    });

    if (existingRiskFactor) {
      throw new ConflictException(
        `A risk factor with the name "${createDto.name}" already exists for this asset`,
      );
    }

    const newRiskFactor = new this.riskFactorModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newRiskFactor.save();
  }

  /**
   * Retrieves risk factors for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<RiskFactorDocument[]>} List of risk factors for the asset.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getRiskFactorsByProperty(
    assetId: string,
    issuerId: string,
  ): Promise<RiskFactorDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.riskFactorModel.find({ assetId, issuerId });
  }

  /**
   * Updates a risk factor by its ID.
   * Validates existence, issuer ownership, and checks for duplicates before updating.
   * @param {string} riskFactorId - The risk factor ID.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateRiskFactorDto} updateDto - The data to update.
   * @returns {Promise<RiskFactorDocument>} The updated risk factor document.
   * @throws {NotFoundException} If risk factor not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate risk factor exists.
   */
  async updateRiskFactor(
    riskFactorId: string,
    issuerId: string,
    updateDto: UpdateRiskFactorDto,
  ): Promise<RiskFactorDocument> {
    // First get the current risk factor to check whether it exists
    const currentRiskFactor = await this.riskFactorModel.findOne({
      _id: riskFactorId,
      issuerId,
    });

    if (!currentRiskFactor) {
      throw new NotFoundException(
        'Risk factor not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingRiskFactor = await this.riskFactorModel.findOne({
        assetId: currentRiskFactor.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: riskFactorId },
      });

      if (existingRiskFactor) {
        throw new ConflictException(
          `A risk factor with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedRiskFactor = await this.riskFactorModel.findOneAndUpdate(
      { _id: riskFactorId, issuerId },
      updateDto,
      { new: true, runValidators: true },
    );

    if (!updatedRiskFactor) {
      throw new NotFoundException(
        'Risk factor not found or does not belong to this issuer',
      );
    }

    return updatedRiskFactor;
  }

  /**
   * Deletes a risk factor by its ID.
   * Ensures the risk factor belongs to the issuer.
   * @param {string} riskFactorId - The risk factor ID.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<RiskFactorDocument>} The deleted risk factor document.
   * @throws {NotFoundException} If risk factor not found or doesn't belong to issuer.
   */
  async deleteRiskFactor(
    riskFactorId: string,
    issuerId: string,
  ): Promise<RiskFactorDocument> {
    const deletedRiskFactor = await this.riskFactorModel.findOneAndDelete({
      _id: riskFactorId,
      issuerId,
    });

    if (!deletedRiskFactor) {
      throw new NotFoundException(
        'Risk factor not found or does not belong to this issuer',
      );
    }

    return deletedRiskFactor;
  }
}

