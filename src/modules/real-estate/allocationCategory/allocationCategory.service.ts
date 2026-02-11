import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  AssetAllocationCategory,
  AssetAllocationCategoryDocument,
} from '../schema/assetAllocationCategory.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateAllocationCategoryDto } from './dto/create-allocation-category.dto';
import { UpdateAllocationCategoryDto } from './dto/update-allocation-category.dto';
import { VestingType } from '../interfaces/assetAllocationCategory.types';

@Injectable()
export class AllocationCategoryService {
  constructor(
    @InjectModel(AssetAllocationCategory.name)
    private readonly allocationCategoryModel: Model<AssetAllocationCategoryDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new allocation category for an asset.
   * Redistributes tokens from existing categories proportionally.
   */
  async createAllocationCategory(
    assetId: string,
    issuerId: string,
    allocationData: CreateAllocationCategoryDto,
  ): Promise<AssetAllocationCategoryDocument> {
    // Verify asset exists and belongs to issuer
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    if (!asset.tokenInformation?.tokenSupply) {
      throw new BadRequestException(
        'Asset token supply must be defined before creating allocation categories',
      );
    }

    const totalSupply = asset.tokenInformation.tokenSupply;
    const requestedTokens = allocationData.tokens || 0;

    // Validate new token amount
    if (requestedTokens <= 0) {
      throw new BadRequestException('Token amount must be greater than 0');
    }

    // Start a session for the transaction
    const session = await this.allocationCategoryModel.startSession();

    try {
      return await session.withTransaction(async () => {
        // Redistribute tokens for new allocation
        await this.redistributeTokens(assetId, issuerId, requestedTokens, session);

        // Calculate percentage for the new allocation
        const percentage = Number(
          ((requestedTokens / totalSupply) * 100).toFixed(8),
        );

        // Create and save the new allocation category
        const allocation = new this.allocationCategoryModel({
          ...allocationData,
          assetId: new Types.ObjectId(assetId),
          issuerId: new Types.ObjectId(issuerId),
          percentage, // Set the calculated percentage
        });

        const savedAllocation = await allocation.save({ session });

        return savedAllocation;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Proportionally redistributes tokens from existing categories when creating a new allocation.
   */
  private async redistributeTokens(
    assetId: string,
    issuerId: string,
    newTokenAmount: number,
    session: ClientSession,
  ): Promise<void> {
    const [existingAllocations, asset] = await Promise.all([
      this.allocationCategoryModel
        .find({ assetId, issuerId })
        .sort({ tokens: -1 })
        .session(session),
      this.assetModel.findOne({ _id: assetId, issuerId }).session(session),
    ]);

    if (!asset?.tokenInformation?.tokenSupply) {
      throw new BadRequestException('Asset token supply not found');
    }

    const totalSupply = asset.tokenInformation.tokenSupply;
    const totalExistingTokens = existingAllocations.reduce(
      (sum, allocation) => sum + allocation.tokens,
      0,
    );

    // Calculate reduction ratio based on new token amount
    const remainingTokens = totalSupply - newTokenAmount;
    const reductionRatio = remainingTokens / totalExistingTokens;

    // Calculate new token amounts for each allocation
    let totalNewTokens = 0;
    const newTokenAmounts = existingAllocations.map((allocation) => {
      const newAmount = Math.max(1, Math.floor(allocation.tokens * reductionRatio));
      totalNewTokens += newAmount;
      return newAmount;
    });

    // Calculate any rounding discrepancy
    const targetRemainingTokens = totalSupply - newTokenAmount;
    const discrepancy = targetRemainingTokens - totalNewTokens;

    // Distribute any rounding discrepancy
    if (discrepancy > 0) {
      let remaining = discrepancy;
      let index = 0;
      while (remaining > 0 && index < existingAllocations.length) {
        newTokenAmounts[index] += 1;
        remaining--;
        index++;
      }
    } else if (discrepancy < 0) {
      let remaining = -discrepancy;
      let index = 0;
      while (remaining > 0 && index < existingAllocations.length) {
        if (newTokenAmounts[index] > 1) {
          newTokenAmounts[index] -= 1;
          remaining--;
        }
        index++;
      }
    }

    // Update all allocations with their new token amounts
    await Promise.all(
      existingAllocations.map((allocation, index) => {
        allocation.tokens = newTokenAmounts[index];
        allocation.percentage = Number(
          ((allocation.tokens / totalSupply) * 100).toFixed(8),
        );
        return allocation.save({ session });
      }),
    );
  }

  /**
   * Gets all allocation categories for a specific asset (issuerId filter applied).
   */
  async getAllocationsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetAllocationCategoryDocument[]> {
    // Verify asset belongs to issuer
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const allocations = await this.allocationCategoryModel
      .find({ assetId, issuerId })
      .sort({ percentage: -1 });

    if (!allocations.length) {
      throw new NotFoundException(
        'No allocation categories found for this asset',
      );
    }

    return allocations;
  }

  /**
   * Redistributes tokens among existing allocations when updating an allocation's token amount.
   */
  private async redistributeTokensForUpdate(
    assetId: string,
    issuerId: string,
    allocationId: string,
    newTokenAmount: number,
    session: ClientSession,
  ): Promise<void> {
    const [currentAllocation, asset] = await Promise.all([
      this.allocationCategoryModel.findOne({ _id: allocationId, issuerId }).session(session),
      this.assetModel.findOne({ _id: assetId, issuerId }).session(session),
    ]);

    if (!currentAllocation) {
      throw new NotFoundException('Allocation not found');
    }

    if (!asset?.tokenInformation?.tokenSupply) {
      throw new BadRequestException('Asset token supply not found');
    }

    const totalSupply = asset.tokenInformation.tokenSupply;
    const tokenDifference = newTokenAmount - currentAllocation.tokens;

    if (tokenDifference === 0) return; // No redistribution needed

    // Get other allocations
    const otherAllocations = await this.allocationCategoryModel
      .find({
        assetId,
        issuerId,
        _id: { $ne: new Types.ObjectId(allocationId) },
      })
      .session(session);

    if (tokenDifference > 0) {
      // Need to take tokens from other allocations
      const remainingTokens = totalSupply - newTokenAmount;
      const totalOtherTokens = otherAllocations.reduce(
        (sum, allocation) => sum + allocation.tokens,
        0,
      );
      const reductionRatio = remainingTokens / totalOtherTokens;

      let totalNewTokens = 0;
      const newTokenAmounts = otherAllocations.map((allocation) => {
        const newAmount = Math.max(1, Math.floor(allocation.tokens * reductionRatio));
        totalNewTokens += newAmount;
        return newAmount;
      });

      // Handle rounding discrepancy
      const targetRemainingTokens = totalSupply - newTokenAmount;
      const discrepancy = targetRemainingTokens - totalNewTokens;

      if (discrepancy > 0) {
        let remaining = discrepancy;
        let index = 0;
        while (remaining > 0 && index < otherAllocations.length) {
          newTokenAmounts[index] += 1;
          remaining--;
          index++;
        }
      }

      // Update other allocations
      await Promise.all(
        otherAllocations.map((allocation, index) => {
          allocation.tokens = newTokenAmounts[index];
          allocation.percentage = Number(
            ((allocation.tokens / totalSupply) * 100).toFixed(8),
          );
          return allocation.save({ session });
        }),
      );
    } else {
      // Distributing tokens back to other allocations
      const additionalTokens = -tokenDifference;
      const totalOtherTokens = otherAllocations.reduce(
        (sum, allocation) => sum + allocation.tokens,
        0,
      );
      const distributionRatio = additionalTokens / totalOtherTokens;

      let totalDistributed = 0;
      const additions = otherAllocations.map((allocation) => {
        const addition = Math.floor(allocation.tokens * distributionRatio);
        totalDistributed += addition;
        return addition;
      });

      // Handle remaining tokens from rounding
      const remaining = additionalTokens - totalDistributed;
      if (remaining > 0) {
        let toDistribute = remaining;
        let index = 0;
        while (toDistribute > 0 && index < otherAllocations.length) {
          additions[index] += 1;
          toDistribute--;
          index++;
        }
      }

      // Update other allocations
      await Promise.all(
        otherAllocations.map((allocation, index) => {
          allocation.tokens += additions[index];
          allocation.percentage = Number(
            ((allocation.tokens / totalSupply) * 100).toFixed(8),
          );
          return allocation.save({ session });
        }),
      );
    }
  }

  /**
   * Updates an existing allocation category (issuerId filter applied).
   */
  async updateAllocationCategory(
    allocationId: string,
    issuerId: string,
    updateData: UpdateAllocationCategoryDto,
  ): Promise<AssetAllocationCategoryDocument> {
    const session = await this.allocationCategoryModel.startSession();

    try {
      return await session.withTransaction(async () => {
        const allocation = await this.allocationCategoryModel
          .findOne({ _id: allocationId, issuerId })
          .session(session);

        if (!allocation) {
          throw new NotFoundException('Allocation category not found');
        }

        // If updating tokens, handle redistribution
        if (updateData.tokens !== undefined) {
          const asset = await this.assetModel
            .findOne({ _id: allocation.assetId, issuerId })
            .session(session);

          if (!asset?.tokenInformation?.tokenSupply) {
            throw new BadRequestException('Asset token supply not found');
          }

          if (updateData.tokens <= 0) {
            throw new BadRequestException('Token amount must be greater than 0');
          }

          // Redistribute tokens if amount is changing
          await this.redistributeTokensForUpdate(
            allocation.assetId.toString(),
            issuerId,
            allocationId,
            updateData.tokens,
            session,
          );
        }

        // Update the allocation
        Object.assign(allocation, updateData);
        const updatedAllocation = await allocation.save({ session });

        return updatedAllocation;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes an allocation category (issuerId filter applied).
   */
  async deleteAllocationCategory(
    allocationId: string,
    issuerId: string,
  ): Promise<{ deletedAllocation: AssetAllocationCategoryDocument; stats: any }> {
    const session = await this.allocationCategoryModel.startSession();

    try {
      return await session.withTransaction(async () => {
        const allocation = await this.allocationCategoryModel
          .findOne({ _id: allocationId, issuerId })
          .session(session);

        if (!allocation) {
          throw new NotFoundException('Allocation category not found');
        }

        // Get all allocations for this asset
        const allAllocations = await this.allocationCategoryModel
          .find({ assetId: allocation.assetId, issuerId })
          .session(session);

        // If this is the last allocation, don't allow deletion
        if (allAllocations.length === 1) {
          throw new BadRequestException(
            'Cannot delete the last allocation category. Asset must have at least one allocation.',
          );
        }

        // Delete the allocation
        await allocation.deleteOne({ session });

        // Get updated stats after deletion
        const stats = await this.getValidationStats(
          allocation.assetId.toString(),
          issuerId,
          session,
        );

        return {
          deletedAllocation: allocation,
          stats,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Gets allocation statistics for an asset (issuerId filter applied).
   */
  async getAllocationStats(assetId: string, issuerId: string) {
    const session = await this.allocationCategoryModel.startSession();

    try {
      return await session.withTransaction(async () => {
        const stats = await this.getValidationStats(assetId, issuerId, session);
        const categories = await this.allocationCategoryModel
          .find({ assetId, issuerId })
          .sort({ percentage: -1 })
          .session(session);

        return {
          ...stats,
          categories,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get validation stats for asset allocations
   */
  private async getValidationStats(
    assetId: string,
    issuerId: string,
    session: ClientSession,
  ) {
    const [allocations, asset] = await Promise.all([
      this.allocationCategoryModel
        .find({ assetId, issuerId })
        .sort({ tokens: -1 })
        .session(session),
      this.assetModel.findOne({ _id: assetId, issuerId }).session(session),
    ]);

    if (!asset?.tokenInformation?.tokenSupply) {
      throw new BadRequestException('Asset token supply not found');
    }

    const totalSupply = asset.tokenInformation.tokenSupply;
    const totalTokens = allocations.reduce((sum, allocation) => sum + allocation.tokens, 0);
    const remainingTokens = totalSupply - totalTokens;
    const totalPercentage = Number(((totalTokens / totalSupply) * 100).toFixed(8));
    const remainingPercentage = Number(((remainingTokens / totalSupply) * 100).toFixed(8));

    return {
      totalPercentage,
      totalTokens,
      remainingPercentage,
      remainingTokens,
      isValid: true,
    };
  }
}

