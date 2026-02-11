import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AssetTenant, AssetTenantDocument } from "../schema/assetTenant.model";
import { Asset, AssetDocument } from "../schema/asset.model";
import { CreateAssetTenantDto } from "./dto/create-asset-tenant.dto";
import { UpdateAssetTenantDto } from "./dto/update-asset-tenant.dto";

// Constants for validation
const MAX_SFTS_PER_TENANT = 1000000; // 1 million sqft as a reasonable maximum
const MIN_RENT_PER_SFT = 0.01; // Minimum rent per square foot
const MAX_RENT_PER_SFT = 10000; // Maximum reasonable rent per square foot
const MAX_TENANTS_PER_ASSET = 1000; // Maximum reasonable number of tenants per asset

interface IRentalMetrics {
  weightedAverageRent: number;
  totalSftsAllocated: number;
  vacancyRate: number;
  grossMonthlyRent: number;
  netMonthlyRent: number;
  grossAnnualRent: number;
  netAnnualRent: number;
  netCashFlow: number;
}

@Injectable()
export class AssetTenantService {
  constructor(
    @InjectModel(AssetTenant.name)
    private readonly assetTenantModel: Model<AssetTenantDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Validates tenant data for rent and space allocation limits.
   */
  private validateTenantData(tenantData: Partial<CreateAssetTenantDto>): void {
    if (tenantData.sftsAllocated !== undefined) {
      if (tenantData.sftsAllocated <= 0) {
        throw new BadRequestException(
          "Square feet allocated must be greater than 0",
        );
      }
      if (tenantData.sftsAllocated > MAX_SFTS_PER_TENANT) {
        throw new BadRequestException(
          `Square feet allocated cannot exceed ${MAX_SFTS_PER_TENANT}`,
        );
      }
    }

    if (tenantData.rentPerSft !== undefined) {
      if (tenantData.rentPerSft < MIN_RENT_PER_SFT) {
        throw new BadRequestException(
          `Rent per square foot must be at least ${MIN_RENT_PER_SFT}`,
        );
      }
      if (tenantData.rentPerSft > MAX_RENT_PER_SFT) {
        throw new BadRequestException(
          `Rent per square foot cannot exceed ${MAX_RENT_PER_SFT}`,
        );
      }
    }
  }

  /**
   * Calculates rental metrics when adding a new tenant.
   */
  private async calculateMetricsForNewTenant(
    assetId: string,
    issuerId: string,
    newTenantData: CreateAssetTenantDto,
  ): Promise<IRentalMetrics> {
    const [existingTenants, asset] = await Promise.all([
      this.assetTenantModel.find({ assetId, issuerId }),
      this.assetModel.findOne({ _id: assetId, issuerId }),
    ]);

    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    let totalWeightedRent = existingTenants.reduce(
      (sum, tenant) => sum + tenant.rentPerSft * tenant.sftsAllocated,
      0,
    );
    console.log(
      "Total weighted rent from existing tenants:",
      totalWeightedRent,
    );
    let totalSftsAllocated = existingTenants.reduce(
      (sum, tenant) => sum + tenant.sftsAllocated,
      0,
    );
    console.log(
      "Total sfts allocated from existing tenants:",
      totalSftsAllocated,
    );

    // Add new tenant's contribution
    totalWeightedRent += newTenantData.rentPerSft * newTenantData.sftsAllocated;
    totalSftsAllocated += newTenantData.sftsAllocated;

    console.log(
      "After adding new tenant - Total weighted rent:",
      totalWeightedRent,
    );
    console.log(
      "After adding new tenant - Total sfts allocated:",
      totalSftsAllocated,
    );

    return this.calculateFinalMetrics(
      asset,
      totalWeightedRent,
      totalSftsAllocated,
    );
  }

  /**
   * Calculates rental metrics when updating a tenant.
   */
  private async calculateMetricsForUpdatedTenant(
    assetId: string,
    issuerId: string,
    currentTenant: AssetTenantDocument,
    updateData: Partial<UpdateAssetTenantDto>,
  ): Promise<IRentalMetrics> {
    const [otherTenants, asset] = await Promise.all([
      this.assetTenantModel.find({
        assetId,
        issuerId,
        _id: { $ne: currentTenant._id },
      }),
      this.assetModel.findOne({ _id: assetId, issuerId }),
    ]);

    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    let totalWeightedRent = otherTenants.reduce(
      (sum, tenant) => sum + tenant.rentPerSft * tenant.sftsAllocated,
      0,
    );
    let totalSftsAllocated = otherTenants.reduce(
      (sum, tenant) => sum + tenant.sftsAllocated,
      0,
    );

    // Add updated tenant's contribution
    const updatedRentPerSft = updateData.rentPerSft ?? currentTenant.rentPerSft;
    const updatedSftsAllocated =
      updateData.sftsAllocated ?? currentTenant.sftsAllocated;

    totalWeightedRent += updatedRentPerSft * updatedSftsAllocated;
    totalSftsAllocated += updatedSftsAllocated;

    return this.calculateFinalMetrics(
      asset,
      totalWeightedRent,
      totalSftsAllocated,
    );
  }

  /**
   * Calculates rental metrics after deleting a tenant.
   */
  private async calculateMetricsAfterTenantDeletion(
    assetId: string,
    issuerId: string,
    tenantToDelete: AssetTenantDocument,
  ): Promise<IRentalMetrics> {
    const [remainingTenants, asset] = await Promise.all([
      this.assetTenantModel.find({
        assetId,
        issuerId,
        _id: { $ne: tenantToDelete._id },
      }),
      this.assetModel.findOne({ _id: assetId, issuerId }),
    ]);

    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    const totalWeightedRent = remainingTenants.reduce(
      (sum, tenant) => sum + tenant.rentPerSft * tenant.sftsAllocated,
      0,
    );
    const totalSftsAllocated = remainingTenants.reduce(
      (sum, tenant) => sum + tenant.sftsAllocated,
      0,
    );

    return this.calculateFinalMetrics(
      asset,
      totalWeightedRent,
      totalSftsAllocated,
    );
  }

  /**
   * Finalizes rental metrics calculations.
   */
  private calculateFinalMetrics(
    asset: AssetDocument,
    totalWeightedRent: number,
    totalSftsAllocated: number,
  ): IRentalMetrics {
    const weightedAverageRent =
      totalSftsAllocated > 0
        ? Number((totalWeightedRent / totalSftsAllocated).toFixed(2))
        : 0;

    const vacancyRate =
      asset.totalNumberOfSfts > 0
        ? Number(
            (
              ((asset.totalNumberOfSfts - totalSftsAllocated) /
                asset.totalNumberOfSfts) *
              100
            ).toFixed(2),
          )
        : 100;

    const grossMonthlyRent = Number(
      (totalSftsAllocated * weightedAverageRent).toFixed(2),
    );
    const netMonthlyRent = Math.max(
      0,
      grossMonthlyRent -
        (asset.rentalInformation?.expenses?.monthlyExpenses || 0),
    );
    const grossAnnualRent = Number((grossMonthlyRent * 12).toFixed(2));
    const netAnnualRent = Number((netMonthlyRent * 12).toFixed(2));
    const netCashFlow = netAnnualRent;

    return {
      weightedAverageRent,
      totalSftsAllocated,
      vacancyRate,
      grossMonthlyRent,
      netMonthlyRent,
      grossAnnualRent,
      netAnnualRent,
      netCashFlow,
    };
  }

  /**
   * Updates the asset's rental information using calculated metrics.
   */
  private async updateAssetRentalInformation(
    assetId: string,
    issuerId: string,
    asset: AssetDocument,
    metrics: IRentalMetrics,
  ): Promise<void> {
    console.log("Updating asset rental information with metrics:", metrics);
    const updatedAsset = await this.assetModel.findOneAndUpdate(
      { _id: assetId, issuerId },
      {
        $set: {
          "rentalInformation.vacancyRate": metrics.vacancyRate,
          "rentalInformation.rentPerSft": metrics.weightedAverageRent,
          "rentalInformation.grossMonthlyRent": metrics.grossMonthlyRent,
          "rentalInformation.netMonthlyRent": metrics.netMonthlyRent,
          "rentalInformation.grossAnnualRent": metrics.grossAnnualRent,
          "rentalInformation.netAnnualRent": metrics.netAnnualRent,
          "rentalInformation.netCashFlow": metrics.netCashFlow,
        },
      },
      { new: true, runValidators: true },
    );
    console.log("Updated asset rental information:", updatedAsset);

    if (!updatedAsset) {
      throw new NotFoundException("Failed to update asset rental information");
    }
  }

  /**
   * Creates a new tenant for an asset.
   */
  async createAssetTenant(
    assetId: string,
    issuerId: string,
    createDto: CreateAssetTenantDto,
  ): Promise<AssetTenantDocument> {
    this.validateTenantData(createDto);

    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }
    console.log("Asset found: 296", asset.name);

    // Check tenant count limit
    const existingTenantCount = await this.assetTenantModel.countDocuments({
      assetId,
      issuerId,
    });
    console.log("Existing tenant count: 302", existingTenantCount);

    if (existingTenantCount >= MAX_TENANTS_PER_ASSET) {
      throw new BadRequestException(
        `Cannot exceed maximum of ${MAX_TENANTS_PER_ASSET} tenants per asset`,
      );
    }

    // Check for duplicate tenant name
    const existingTenant = await this.assetTenantModel.findOne({
      assetId,
      issuerId,
      name: createDto.name,
    });

    if (existingTenant) {
      throw new ConflictException(
        `A tenant with the name "${createDto.name}" already exists for this asset`,
      );
    }

    // Calculate new metrics
    const metrics = await this.calculateMetricsForNewTenant(
      assetId,
      issuerId,
      createDto,
    );
    console.log("Calculated metrics: 328", metrics);
    // Validate total space allocation
    if (metrics.totalSftsAllocated > asset.totalNumberOfSfts) {
      throw new BadRequestException(
        `Total sfts allocated (${metrics.totalSftsAllocated}) would exceed the asset's total sfts (${asset.totalNumberOfSfts})`,
      );
    }

    // Update asset rental information
    await this.updateAssetRentalInformation(assetId, issuerId, asset, metrics);

    // Create new tenant
    const newTenant = new this.assetTenantModel({
      ...createDto,
      assetId,
      issuerId,
    });

    return await newTenant.save();
  }

  /**
   * Retrieves a tenant by tenant ID.
   */
  async getAssetTenantById(
    tenantId: string,
    issuerId: string,
  ): Promise<AssetTenantDocument> {
    const tenant = await this.assetTenantModel.findOne({
      _id: tenantId,
      issuerId,
    });

    if (!tenant) {
      throw new NotFoundException(
        "Tenant not found or does not belong to this issuer",
      );
    }

    return tenant;
  }

  /**
   * Updates a tenant by tenant ID.
   */
  async updateAssetTenantById(
    tenantId: string,
    issuerId: string,
    updateDto: UpdateAssetTenantDto,
  ): Promise<AssetTenantDocument> {
    this.validateTenantData(updateDto);

    const currentTenant = await this.assetTenantModel.findOne({
      _id: tenantId,
      issuerId,
    });

    if (!currentTenant) {
      throw new NotFoundException(
        "Tenant not found or does not belong to this issuer",
      );
    }

    const asset = await this.assetModel.findOne({
      _id: currentTenant.assetId,
      issuerId,
    });

    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    // Check for duplicate name if name is being updated
    if (updateDto.name && updateDto.name !== currentTenant.name) {
      const existingTenant = await this.assetTenantModel.findOne({
        assetId: currentTenant.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: tenantId },
      });

      if (existingTenant) {
        throw new ConflictException(
          `A tenant with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    // Recalculate metrics if space or rent is being updated
    if (updateDto.sftsAllocated || updateDto.rentPerSft) {
      const metrics = await this.calculateMetricsForUpdatedTenant(
        currentTenant.assetId.toString(),
        issuerId,
        currentTenant,
        updateDto,
      );

      if (metrics.totalSftsAllocated > asset.totalNumberOfSfts) {
        throw new BadRequestException(
          `Total sfts allocated (${metrics.totalSftsAllocated}) would exceed the asset's total sfts (${asset.totalNumberOfSfts})`,
        );
      }

      await this.updateAssetRentalInformation(
        currentTenant.assetId.toString(),
        issuerId,
        asset,
        metrics,
      );
    }

    // Update tenant
    const updatedTenant = await this.assetTenantModel.findOneAndUpdate(
      { _id: tenantId, issuerId },
      updateDto,
      { new: true, runValidators: true },
    );

    if (!updatedTenant) {
      throw new NotFoundException(
        "Tenant not found or does not belong to this issuer",
      );
    }

    return updatedTenant;
  }

  /**
   * Retrieves all tenants for a specific asset.
   */
  async getAllTenantsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetTenantDocument[]> {
    // Check if asset exists
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    return await this.assetTenantModel.find({ assetId, issuerId });
  }

  /**
   * Deletes all tenants for a specific asset.
   */
  async deleteAllAssetTenantsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<{ deletedCount: number }> {
    // Check if asset exists
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    const result = await this.assetTenantModel.deleteMany({
      assetId,
      issuerId,
    });
    return { deletedCount: result.deletedCount || 0 };
  }

  /**
   * Deletes a specific tenant by ID.
   */
  async deleteAssetTenantById(
    tenantId: string,
    issuerId: string,
  ): Promise<void> {
    const tenant = await this.assetTenantModel.findOne({
      _id: tenantId,
      issuerId,
    });

    if (!tenant) {
      throw new NotFoundException(
        "Tenant not found or does not belong to this issuer",
      );
    }

    const asset = await this.assetModel.findOne({
      _id: tenant.assetId,
      issuerId,
    });

    if (!asset) {
      throw new NotFoundException(
        "Asset not found or does not belong to this issuer",
      );
    }

    // Calculate metrics after deletion
    const metrics = await this.calculateMetricsAfterTenantDeletion(
      tenant.assetId.toString(),
      issuerId,
      tenant,
    );

    // Update asset rental information before deleting tenant
    await this.updateAssetRentalInformation(
      tenant.assetId.toString(),
      issuerId,
      asset,
      metrics,
    );

    // Delete tenant
    await this.assetTenantModel.findOneAndDelete({ _id: tenantId, issuerId });
  }
}
