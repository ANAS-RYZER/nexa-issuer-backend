import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssetService } from '../real-estate.service';
import {
  AssetFeeConfig,
  AssetFeeConfigDocument,
} from '../schema/assetFeeConfig.model';
import { CreateAssetFeeConfigDto } from '../dto/fees.dto';
import { UpdateAssetFeeConfigDto } from '../dto/fees.dto';
import { FeeType } from '../interfaces/assetFeeConfig.types';

@Injectable()
export class FeeService {
  constructor(
    @InjectModel(AssetFeeConfig.name)
    private readonly assetFeeConfigModel: Model<AssetFeeConfigDocument>,
    private readonly assetService: AssetService,
  ) {}

  /**
   * Creates a new asset fee configuration.
   * Validates asset existence, percentage limits, and duplicate fee configs before saving.
   * Updates asset's total property value after fees if the fee config is active.
   */
  async createAssetFeeConfig(
    assetId: string,
    issuerId: string,
    createAssetFeeConfigDto: CreateAssetFeeConfigDto,
  ): Promise<AssetFeeConfigDocument> {
    if (!assetId) {
      throw new BadRequestException('Asset ID is required');
    }

    // Check if asset exists
    const asset = await this.assetService.getAssetById(assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check if fee config with same name and fee type already exists for this asset
    const existingFeeConfig = await this.assetFeeConfigModel.findOne({
      assetId: new Types.ObjectId(assetId),
      name: createAssetFeeConfigDto.name,
      type: createAssetFeeConfigDto.type,
    });

    if (existingFeeConfig) {
      throw new ConflictException(
        `A fee configuration with the name "${createAssetFeeConfigDto.name}" already exists for this asset and fee type`,
      );
    }

    if (
      createAssetFeeConfigDto.isPercentage &&
      createAssetFeeConfigDto.value > 99
    ) {
      throw new BadRequestException(
        'Percentage value cannot be greater than 99',
      );
    }

    // Calculate and update asset's total property value after fees if status is active
    if (createAssetFeeConfigDto.status === true) {
      let totalPropertyValueAfterFees: number;
      if (createAssetFeeConfigDto.isPercentage) {
        totalPropertyValueAfterFees =
          (asset?.totalPropertyValueAfterFees || 0) +
          ((createAssetFeeConfigDto?.value || 0) / 100) *
            (asset?.basePropertyValue || 0);
      } else {
        totalPropertyValueAfterFees =
          (asset?.totalPropertyValueAfterFees || 0) +
          createAssetFeeConfigDto.value;
      }

      await this.assetService.updateAsset(assetId, {
        totalPropertyValueAfterFees: totalPropertyValueAfterFees,
      });
    }

    // Create the fee config
    const newAssetFeeConfig = new this.assetFeeConfigModel({
      ...createAssetFeeConfigDto,
      assetId: new Types.ObjectId(assetId),
      issuerId: issuerId,
    });

    const savedFeeConfig = await newAssetFeeConfig.save();
    if (!savedFeeConfig) {
      throw new BadRequestException('Failed to create asset fee config');
    }

    return savedFeeConfig;
  }

  /**
   * Retrieves fee configs for a specific asset and optional fee type.
   * Syncs global fee configs if none exist and not already synced.
   */
  async getAssetFeeConfigByAssetId(
    assetId: string,
    feeType?: FeeType,
  ): Promise<AssetFeeConfigDocument[]> {
    if (!assetId) {
      throw new BadRequestException('Asset ID is required');
    }

    // Build filter based on parameters
    const filter: any = { assetId: new Types.ObjectId(assetId) };
    if (feeType) filter.type = feeType;

    // Check if there are any fee configs for this asset and fee type
    const existingFeeConfigs = await this.assetFeeConfigModel.find(filter);

    // Get asset details
    const asset = await this.assetService.getAssetById(assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // TODO: Implement GlobalFeeConfig service when available
    // For now, if no configs exist, we'll just return empty array
    // The original code synced from globalFeeConfig, but that service doesn't exist yet
    if (existingFeeConfigs.length === 0) {
      // Check if asset has the sync flag (if it exists in the schema)
      // For now, we'll return empty array
      return existingFeeConfigs;
    }

    return existingFeeConfigs;
  }

  /**
   * Retrieves all asset fee configurations across all assets.
   */
  async getAllAssetFeeConfigs(): Promise<AssetFeeConfigDocument[]> {
    const assetFeeConfigs = await this.assetFeeConfigModel.find();
    return assetFeeConfigs;
  }

  /**
   * Updates an asset fee configuration by its ID.
   * Checks for duplicates, updates asset financials if status changes, and updates the config.
   */
  async updateAssetFeeConfig(
    feeConfigId: string,
    updateAssetFeeConfigDto: UpdateAssetFeeConfigDto,
  ): Promise<AssetFeeConfigDocument> {
    if (!feeConfigId) {
      throw new BadRequestException('Fee config ID is required');
    }

    // Get the current fee config
    const currentFeeConfig = await this.assetFeeConfigModel.findById(
      feeConfigId,
    );

    if (!currentFeeConfig) {
      throw new NotFoundException('Asset fee configuration not found');
    }

    // If name is being updated, check for duplicates
    if (updateAssetFeeConfigDto.name) {
      const existingFeeConfig = await this.assetFeeConfigModel.findOne({
        assetId: currentFeeConfig.assetId,
        name: updateAssetFeeConfigDto.name,
        type:
          updateAssetFeeConfigDto.type || currentFeeConfig.type,
        _id: { $ne: feeConfigId }, // Exclude the current fee config
      });

      if (existingFeeConfig) {
        throw new ConflictException(
          `A fee configuration with the name "${updateAssetFeeConfigDto.name}" already exists for this asset and fee type`,
        );
      }
    }

    // Get asset details
    const asset = await this.assetService.getAssetById(
      currentFeeConfig.assetId.toString(),
    );

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Handle status changes - update asset's total property value after fees
    if (updateAssetFeeConfigDto.status !== undefined) {
      const isActivating =
        updateAssetFeeConfigDto.status === true &&
        currentFeeConfig.status === false;
      const isDeactivating =
        updateAssetFeeConfigDto.status === false &&
        currentFeeConfig.status === true;

      if (isActivating) {
        let totalPropertyValueAfterFees: number;
        const valueToUse =
          updateAssetFeeConfigDto.value ?? currentFeeConfig.value;
        const isPercentageToUse =
          updateAssetFeeConfigDto.isPercentage ??
          currentFeeConfig.isPercentage;

        if (isPercentageToUse) {
          totalPropertyValueAfterFees =
            (asset?.totalPropertyValueAfterFees || 0) +
            ((valueToUse || 0) / 100) * (asset?.basePropertyValue || 0);
        } else {
          totalPropertyValueAfterFees =
            (asset?.totalPropertyValueAfterFees || 0) + (valueToUse || 0);
        }

        await this.assetService.updateAsset(
          currentFeeConfig.assetId.toString(),
          {
            totalPropertyValueAfterFees: totalPropertyValueAfterFees,
          },
        );
      }

      if (isDeactivating) {
        let totalPropertyValueAfterFees: number;
        // When deactivating, we need to subtract the OLD value (currentFeeConfig)
        // because the fee was already added when it was active
        const valueToUse = currentFeeConfig.value;
        const isPercentageToUse = currentFeeConfig.isPercentage;

        if (isPercentageToUse) {
          totalPropertyValueAfterFees =
            (asset?.totalPropertyValueAfterFees || 0) -
            ((valueToUse || 0) / 100) * (asset?.basePropertyValue || 0);
        } else {
          totalPropertyValueAfterFees =
            (asset?.totalPropertyValueAfterFees || 0) - (valueToUse || 0);
        }

        await this.assetService.updateAsset(
          currentFeeConfig.assetId.toString(),
          {
            totalPropertyValueAfterFees: totalPropertyValueAfterFees,
          },
        );
      }
    }

    // Update the fee config
    const updatedAssetFeeConfig =
      await this.assetFeeConfigModel.findByIdAndUpdate(
        feeConfigId,
        updateAssetFeeConfigDto,
        { new: true, runValidators: true },
      );

    if (!updatedAssetFeeConfig) {
      throw new NotFoundException('Asset fee configuration not found');
    }

    return updatedAssetFeeConfig;
  }

  /**
   * Deletes an asset fee configuration by its ID.
   * Updates the asset's total property value after fees accordingly.
   */
  async deleteAssetFeeConfig(
    feeConfigId: string,
  ): Promise<AssetFeeConfigDocument> {
    if (!feeConfigId) {
      throw new BadRequestException('Fee config ID is required');
    }

    const assetFeeConfig = await this.assetFeeConfigModel.findById(feeConfigId);
    if (!assetFeeConfig) {
      throw new NotFoundException('Asset fee configuration not found');
    }

    const asset = await this.assetService.getAssetById(
      assetFeeConfig.assetId.toString(),
    );
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Update asset's total property value after fees if the fee config was active
    if (assetFeeConfig.status) {
      let totalPropertyValueAfterFees: number;
      if (assetFeeConfig.isPercentage) {
        totalPropertyValueAfterFees =
          (asset?.totalPropertyValueAfterFees || 0) -
          (assetFeeConfig.value / 100) * (asset?.basePropertyValue || 0);
      } else {
        totalPropertyValueAfterFees =
          (asset?.totalPropertyValueAfterFees || 0) - assetFeeConfig.value;
      }

      await this.assetService.updateAsset(asset._id.toString(), {
        totalPropertyValueAfterFees: totalPropertyValueAfterFees,
      });
    }

    // Delete the fee config
    const deletedAssetFeeConfig =
      await this.assetFeeConfigModel.findByIdAndDelete(feeConfigId);

    if (!deletedAssetFeeConfig) {
      throw new NotFoundException('Asset fee configuration not found');
    }

    return deletedAssetFeeConfig;
  }
}