import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdditionalTax,
  AdditionalTaxDocument,
} from '../schema/assetAdditionalTax.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateAdditionalTaxDto } from './dto/create-additional-tax.dto';
import { UpdateAdditionalTaxDto } from './dto/update-additional-tax.dto';

@Injectable()
export class AdditionalTaxService {
  constructor(
    @InjectModel(AdditionalTax.name)
    private readonly additionalTaxModel: Model<AdditionalTaxDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Create a new additional tax for a specific asset.
   * Validates asset existence and ensures no duplicate tax name for the asset.
   */
  async createAdditionalTax(
    assetId: string,
    issuerId: string,
    additionalTaxDto: CreateAdditionalTaxDto,
  ): Promise<AdditionalTaxDocument> {
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

    // Check for duplicate tax name
    const existingTax = await this.additionalTaxModel.findOne({
      assetId,
      issuerId,
      name: additionalTaxDto.name,
    });

    if (existingTax) {
      throw new ConflictException(
        `A tax with the name "${additionalTaxDto.name}" already exists for this asset`,
      );
    }

    const newTax = new this.additionalTaxModel({
      assetId: new Types.ObjectId(assetId),
      issuerId: new Types.ObjectId(issuerId),
      ...additionalTaxDto,
    });

    return await newTax.save();
  }

  /**
   * Retrieve all additional taxes for a property.
   * Note: Global tax sync logic is commented out as GlobalAdditionalTaxService is not available
   */
  async getAdditionalTaxByProperty(
    assetId: string,
    issuerId: string,
  ): Promise<AdditionalTaxDocument[]> {
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

    // Get all taxes for this asset
    const existingTaxes = await this.additionalTaxModel.find({
      assetId,
      issuerId,
    });

    // TODO: Implement global tax sync when GlobalAdditionalTaxService is available
    // if (!asset.hasGlobalAdditionalTaxesSynced && existingTaxes.length === 0) {
    //   // Sync from global taxes
    // }

    return existingTaxes;
  }

  /**
   * Update an existing additional tax.
   * Validates existence and ensures no duplicate tax name for the asset.
   */
  async updateAdditionalTax(
    taxId: string,
    issuerId: string,
    updateDto: UpdateAdditionalTaxDto,
  ): Promise<AdditionalTaxDocument> {
    if (!taxId) {
      throw new BadRequestException('Tax ID is required');
    }

    // Get current tax
    const currentTax = await this.additionalTaxModel.findOne({
      _id: taxId,
      issuerId: issuerId,
    });

    if (!currentTax) {
      throw new NotFoundException('Additional tax not found');
    }

    // Check for duplicate name if name is being updated
    if (updateDto.name && updateDto.name !== currentTax.name) {
      const existingTax = await this.additionalTaxModel.findOne({
        assetId: currentTax.assetId,
        issuerId: issuerId,
        name: updateDto.name,
        _id: { $ne: taxId },
      });

      if (existingTax) {
        throw new ConflictException(
          `A tax with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const updatedTax = await this.additionalTaxModel.findOneAndUpdate(
      { _id: taxId, issuerId: issuerId },
      { ...updateDto },
      { new: true, runValidators: true },
    );

    if (!updatedTax) {
      throw new NotFoundException('Additional tax not found');
    }

    return updatedTax;
  }

  /**
   * Delete an additional tax by its ID (issuerId filter applied).
   */
  async deleteAdditionalTax(
    taxId: string,
    issuerId: string,
  ): Promise<AdditionalTaxDocument> {
    if (!taxId) {
      throw new BadRequestException('Tax ID is required');
    }

    const deletedTax = await this.additionalTaxModel.findOneAndDelete({
      _id: taxId,
      issuerId: issuerId,
    });

    if (!deletedTax) {
      throw new NotFoundException('Additional tax not found');
    }

    return deletedTax;
  }
}

