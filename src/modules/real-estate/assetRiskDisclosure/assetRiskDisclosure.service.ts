import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RiskDisclosure,
  RiskDisclosureDocument,
} from '../schema/assetRiskDisclosure.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateRiskDisclosureDto } from './dto/create-risk-disclosure.dto';
import { UpdateRiskDisclosureDto } from './dto/update-risk-disclosure.dto';

@Injectable()
export class AssetRiskDisclosureService {
  constructor(
    @InjectModel(RiskDisclosure.name)
    private readonly riskDisclosureModel: Model<RiskDisclosureDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new risk disclosure for an asset.
   * Checks asset existence, issuer ownership, and ensures no duplicate disclosure with the same name exists.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateRiskDisclosureDto} createDto - The risk disclosure data.
   * @returns {Promise<RiskDisclosureDocument>} The created risk disclosure document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate disclosure exists.
   */
  async createRiskDisclosure(
    assetId: string,
    issuerId: string,
    createDto: CreateRiskDisclosureDto,
  ): Promise<RiskDisclosureDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if risk disclosure with same name already exists for this asset
    const existingRiskDisclosure = await this.riskDisclosureModel.findOne({
      assetId,
      issuerId,
      name: createDto.name,
    });

    if (existingRiskDisclosure) {
      throw new ConflictException(
        `A risk disclosure with the name "${createDto.name}" already exists for this asset`,
      );
    }

    const newRiskDisclosure = new this.riskDisclosureModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newRiskDisclosure.save();
  }

  /**
   * Retrieves risk disclosures for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<RiskDisclosureDocument[]>} List of risk disclosures for the asset.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getRiskDisclosureByProperty(
    assetId: string,
    issuerId: string,
  ): Promise<RiskDisclosureDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.riskDisclosureModel.find({ assetId, issuerId });
  }

  /**
   * Updates a risk disclosure by its ID.
   * Validates existence, issuer ownership, and checks for duplicates before updating.
   * @param {string} riskDisclosureId - The risk disclosure ID.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateRiskDisclosureDto} updateDto - Data to update.
   * @returns {Promise<RiskDisclosureDocument>} The updated risk disclosure document.
   * @throws {NotFoundException} If disclosure not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate disclosure exists.
   */
  async updateRiskDisclosure(
    riskDisclosureId: string,
    issuerId: string,
    updateDto: UpdateRiskDisclosureDto,
  ): Promise<RiskDisclosureDocument> {
    // First get the current risk disclosure to check whether it exists
    const currentRiskDisclosure = await this.riskDisclosureModel.findOne({
      _id: riskDisclosureId,
      issuerId,
    });

    if (!currentRiskDisclosure) {
      throw new NotFoundException(
        'Risk disclosure not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingRiskDisclosure = await this.riskDisclosureModel.findOne({
        assetId: currentRiskDisclosure.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: riskDisclosureId },
      });

      if (existingRiskDisclosure) {
        throw new ConflictException(
          `A risk disclosure with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedRiskDisclosure =
      await this.riskDisclosureModel.findOneAndUpdate(
        { _id: riskDisclosureId, issuerId },
        updateDto,
        { new: true, runValidators: true },
      );

    if (!updatedRiskDisclosure) {
      throw new NotFoundException(
        'Risk disclosure not found or does not belong to this issuer',
      );
    }

    return updatedRiskDisclosure;
  }

  /**
   * Deletes a risk disclosure by its ID.
   * Ensures the disclosure belongs to the issuer.
   * @param {string} riskDisclosureId - The risk disclosure ID.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<RiskDisclosureDocument>} The deleted risk disclosure document.
   * @throws {NotFoundException} If disclosure not found or doesn't belong to issuer.
   */
  async deleteRiskDisclosure(
    riskDisclosureId: string,
    issuerId: string,
  ): Promise<RiskDisclosureDocument> {
    const deletedRiskDisclosure =
      await this.riskDisclosureModel.findOneAndDelete({
        _id: riskDisclosureId,
        issuerId,
      });

    if (!deletedRiskDisclosure) {
      throw new NotFoundException(
        'Risk disclosure not found or does not belong to this issuer',
      );
    }

    return deletedRiskDisclosure;
  }
}

