import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { Asset, AssetDocument } from "./schema/asset.model";
import {
  AssetFeeConfig,
  AssetFeeConfigDocument,
} from "./schema/assetFeeConfig.model";
import { SPV, SPVDocument } from "../spv/schemas/spv.schema";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { AdminAssetListingQueryDto } from "./dto/admin-asset-listing-query.dto";
import {
  STATIC_RESERVE_FEE_CONFIG,
  STATIC_INSURANCE_FEE_CONFIG,
  FeeType,
} from "./interfaces/assetFeeConfig.types";
import { AssetStatus } from "./interfaces/asset.type";
import { ITokenInformation } from "./interfaces/asset.type";
import {
  AdminAssetListingResponse,
  AdminAssetListingItem,
} from "./interfaces/admin-asset-listing.interface";
import { ExchangeRateService } from "../exchangeRate/exchange-rate.service";

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
    @InjectModel(AssetFeeConfig.name)
    private readonly assetFeeConfigModel: Model<AssetFeeConfigDocument>,
    @InjectModel(SPV.name)
    private readonly spvModel: Model<SPVDocument>,

    private readonly exchanteRateService: ExchangeRateService,
  ) {}

  /**
   * Get all public assets with issuer details
   * No authentication required - public endpoint
   */
  /**
   * Get all public assets with issuer details (with pagination)
   * No authentication required - public endpoint
   */
  /**
   * Get all public assets with advanced filtering, sorting, and search
   * Optimized and scalable implementation
   */
  async convertCurrency(
    from: string,
    to: string,
    amount: number,
  ): Promise<number> {
    try {
      const convertedAmount = await this.exchanteRateService.convert(
        from,
        to,
        amount,
      );
      console.log(
        `Converted ${amount} from ${from} to ${to}: ${convertedAmount}`,
      );
      return convertedAmount;
    } catch (error: any) {
      console.error("Currency conversion error:", error);
      throw new BadRequestException(
        `Currency conversion failed: ${error.message}`,
      );
    }
  }
  async getPublicAssetList(
    query: {
      page?: number;
      limit?: number;
      sort?: "high-returns" | "low-returns" | "newest";
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      assetStatus?: "active" | "completed" | "waitlist";
      category?: string;
      class?: string;
      search?: string;
      city?: string;
      state?: string;
      country?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    currency: string,
  ): Promise<{
    assets: any[];
    userCurrency: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      assetStatus?: string;
      category?: string;
      class?: string;
      search?: string;
      city?: string;
      state?: string;
      country?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    };
    message: string;
  }> {
    try {
      // ========================================
      // PAGINATION SETUP
      // ========================================
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      // ========================================
      // BUILD FILTER QUERY
      // ========================================
      const filter: any = {
        status: AssetStatus.APPROVED, // Base requirement: only approved assets
      };

      // ========================================
      // ASSET STATUS FILTER (active, completed)
      // ========================================
      if (query.assetStatus) {
        switch (query.assetStatus) {
          case "active":
            // Active: Approved assets with tokens available
            filter["tokenInformation.availableTokensToBuy"] = { $gt: 0 };
            break;

          case "completed":
            // Completed: Approved assets with no tokens available (sold out)
            filter["tokenInformation.availableTokensToBuy"] = 0;
            break;
        }
      }

      // ========================================
      // CATEGORY & CLASS FILTERS
      // ========================================
      if (query.category) {
        filter.category = query.category;
      }

      if (query.class) {
        filter.class = query.class;
      }

      // ========================================
      // LOCATION FILTERS (Case-insensitive)
      // ========================================
      if (query.city) {
        filter.city = new RegExp(query.city, "i");
      }

      if (query.state) {
        filter.state = new RegExp(query.state, "i");
      }

      if (query.country) {
        filter.country = new RegExp(query.country, "i");
      }

      // ========================================
      // PRICE RANGE FILTER
      // ========================================
      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filter["tokenInformation.tokenPrice"] = {};

        if (query.minPrice !== undefined) {
          filter["tokenInformation.tokenPrice"].$gte = query.minPrice;
        }

        if (query.maxPrice !== undefined) {
          filter["tokenInformation.tokenPrice"].$lte = query.maxPrice;
        }
      }
      if (query.search) {
        const searchRegex = new RegExp(query.search, "i");
        filter.$or = [
          { name: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
          { country: searchRegex },
          { landmark: searchRegex },
        ];
      }

      let sort: any = {};

      // Priority 1: Advanced sort options
      if (query.sort) {
        switch (query.sort) {
          case "high-returns":
            sort = { "investmentPerformance.irr": -1 };
            break;
          case "low-returns":
            sort = { "investmentPerformance.irr": 1 };
            break;
          case "newest":
            sort = { createdAt: -1 };
            break;
        }
      }
      // Priority 2: Standard sortBy + sortOrder
      else if (query.sortBy) {
        sort[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
      }
      // Default: Sort by newest
      else {
        sort = { createdAt: -1 };
      }

      // Get total count with all filters applied
      const total = await this.assetModel.countDocuments(filter);

      // Get paginated assets with selected fields
      const assets = await this.assetModel
        .find(filter)
        .select(
          "class category name about country state city landmark currency " +
            "totalPropertyValueAfterFees investmentPerformance.grossRentalYield " +
            "investmentPerformance.irr tokenInformation.tokenSupply " +
            "tokenInformation.tokenPrice tokenInformation.minimumTokensToBuy " +
            "tokenInformation.maximumTokensToBuy tokenInformation.availableTokensToBuy " +
            "issuerId spvId status createdAt updatedAt media",
        )
        .populate("issuerId", "email firstName lastName phoneNumber")
        .populate("spvId", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const assetsWithConvertedCurrency = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          tokenInformation: {
            ...asset.tokenInformation,
            tokenPrice: await this.convertCurrency(
              asset.currency,
              currency,
              asset?.tokenInformation?.tokenPrice || 0,
            ),
          },
          totalPropertyValueAfterFees: await this.convertCurrency(
            asset.currency,
            currency,
            asset?.totalPropertyValueAfterFees || 0,
          ),
        })),
      );

      const totalPages = Math.ceil(total / limit);

      return {
        assets: assetsWithConvertedCurrency,
        userCurrency: currency,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          assetStatus: query.assetStatus,
          category: query.category,
          class: query.class,
          search: query.search,
          city: query.city,
          state: query.state,
          country: query.country,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          sort: query.sort,
        },
        message: "User assets fetched successfully",
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to fetch public assets: ${error.message}`,
      );
    }
  }

  /**
   * Get complete asset details by ID for public/user view
   * Includes all related information: company, fees, amenities, reviews, bookmarks, etc.
   * Optimized aggregation pipeline for performance
   */
  async getPublicAssetById(assetId: string, investorId?: string): Promise<any> {
    // Validate asset ID
    if (!Types.ObjectId.isValid(assetId)) {
      throw new BadRequestException("Invalid asset ID format");
    }

    const objectId = new Types.ObjectId(assetId);
    const investorObjectId =
      investorId && Types.ObjectId.isValid(investorId)
        ? new Types.ObjectId(investorId)
        : null;

    // ========================================
    // BUILD AGGREGATION PIPELINE
    // ========================================
    const pipeline: PipelineStage[] = [
      // Match the specific asset
      { $match: { _id: objectId, status: AssetStatus.APPROVED } },

      // ========================================
      // LOOKUP ISSUER DETAILS
      // ========================================
      {
        $lookup: {
          from: "issuerprofiles", // ✅ Correct collection name
          let: { issuerId: "$issuerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$issuerId"] } } },
            {
              $project: {
                _id: 1,
                email: 1,
                firstName: 1,
                lastName: 1,
                phoneNumber: 1,
                kycStatus: 1,
                metadata: 1,
                createdAt: 1,
              },
            },
          ],
          as: "issuer",
        },
      },
      { $unwind: { path: "$issuer", preserveNullAndEmptyArrays: true } },

      // ========================================
      // LOOKUP SPV/COMPANY
      // ========================================
      {
        $lookup: {
          from: "spvs",
          let: { spvId: "$spvId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$spvId"] } } },
            {
              $project: {
                name: 1,
                registrationNumber: 1,
                currency: 1,
                boardMembers: 1,
              },
            },
          ],
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

      // ========================================
      // LOOKUP FAQS
      // ========================================
      {
        $lookup: {
          from: "faqs",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "faqs",
        },
      },

      // ========================================
      // LOOKUP TENANTS
      // ========================================
      {
        $lookup: {
          from: "assettenants",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "tenants",
        },
      },

      // ========================================
      // LOOKUP DOCUMENTS
      // ========================================
      {
        $lookup: {
          from: "assetdocuments",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "documents",
        },
      },

      // ========================================
      // LOOKUP AMENITIES
      // ========================================
      {
        $lookup: {
          from: "amenities",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "amenities",
        },
      },

      // ========================================
      // LOOKUP EXPENSES
      // ========================================
      {
        $lookup: {
          from: "assetExpenses",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "expenses",
        },
      },

      // ========================================
      // LOOKUP FEATURES
      // ========================================
      {
        $lookup: {
          from: "features",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "features",
        },
      },

      // ========================================
      // LOOKUP RISK FACTORS
      // ========================================
      {
        $lookup: {
          from: "riskfactors",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "riskFactors",
        },
      },

      // ========================================
      // LOOKUP RISK DISCLOSURES
      // ========================================
      {
        $lookup: {
          from: "riskdisclosures",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "riskDisclosures",
        },
      },

      // ========================================
      // LOOKUP TERMS AND CONDITIONS
      // ========================================
      {
        $lookup: {
          from: "assettermsandconditions",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "termsAndConditions",
        },
      },

      // ========================================
      // LOOKUP EXIT OPPORTUNITIES
      // ========================================
      {
        $lookup: {
          from: "exitopportunities",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "exitOpportunities",
        },
      },

      // ========================================
      // LOOKUP ADDITIONAL TAXES
      // ========================================
      {
        $lookup: {
          from: "assetAdditionalTaxes",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "additionalTaxes",
        },
      },

      // ========================================
      // LOOKUP DUE DILIGENCE - LEGAL
      // ========================================
      {
        $lookup: {
          from: "assetduediligencelegals",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceLegal",
        },
      },

      // ========================================
      // LOOKUP DUE DILIGENCE - STRUCTURE
      // ========================================
      {
        $lookup: {
          from: "assetduediligencestructures",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceStructure",
        },
      },

      // ========================================
      // LOOKUP DUE DILIGENCE - VALUATION
      // ========================================
      {
        $lookup: {
          from: "assetduediligencevaluations",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceValuation",
        },
      },

      // ========================================
      // LOOKUP SIGNATURE DOCUMENTS
      // ========================================
      {
        $lookup: {
          from: "documenttemplates",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "signatureDocuments",
        },
      },

      // ========================================
      // LOOKUP NEARBY LOCATIONS
      // ========================================
      {
        $lookup: {
          from: "nearbylocations",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "nearByLocations",
        },
      },

      // Clean up temporary fields
      {
        $project: {
          bookmarkData: 0,
          reviewData: 0,
          fundsData: 0,
        },
      },
    ];

    // ========================================
    // EXECUTE AGGREGATION
    // ========================================
    const result = await this.assetModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        "Asset not found or not approved for public viewing",
      );
    }

    const asset = result[0];
    const assetFees = await this.assetFeeConfigModel
      .find({ assetId: objectId })
      .lean();

    const assetFeesByTypes: Record<string, any[]> = assetFees.reduce(
      (acc: Record<string, any[]>, fee: any) => {
        const feeType = fee.type.toLowerCase();
        if (!acc[feeType]) {
          acc[feeType] = [];
        }
        acc[feeType].push(fee);
        return acc;
      },
      Object.values(FeeType).reduce(
        (obj, type) => {
          obj[type.toLowerCase()] = [];
          return obj;
        },
        {} as Record<string, any[]>,
      ),
    );

    // ========================================
    // GROUP NEARBY LOCATIONS BY TYPE
    // ========================================
    const nearByLocationsByType: Record<string, any[]> = {};
    if (asset.nearByLocations && asset.nearByLocations.length > 0) {
      asset.nearByLocations.forEach((location: any) => {
        const type = location.locationType || "other";
        if (!nearByLocationsByType[type]) {
          nearByLocationsByType[type] = [];
        }
        nearByLocationsByType[type].push(location);
      });
    }

    // ========================================
    // BUILD ENRICHED RESPONSE
    // ========================================
    const enrichedAsset = {
      ...asset,
      fees: assetFeesByTypes,
      nearByLocations: nearByLocationsByType,
      dueDiligence: {
        legal: asset.dueDiligenceLegal || [],
        structure: asset.dueDiligenceStructure || [],
        valuation: asset.dueDiligenceValuation || [],
      },
      // Set defaults for Order-related fields (until Order model is implemented)
      investors: asset.investors || [],
      issuer: asset.issuer || null,
      totalFundsRaised: asset.totalFundsRaised || 0,
      completedOrdersCount: asset.completedOrdersCount || 0,
      // Clean up aggregation artifacts
      dueDiligenceLegal: undefined,
      dueDiligenceStructure: undefined,
      dueDiligenceValuation: undefined,
    };

    // Remove undefined fields
    Object.keys(enrichedAsset).forEach((key) => {
      if (enrichedAsset[key] === undefined) {
        delete enrichedAsset[key];
      }
    });

    return enrichedAsset;
  }

  async createAssetBasicDetails(
    assetData: CreateAssetDto,
    issuerId: string,
  ): Promise<AssetDocument> {
    // Check if the SPV exists
    const existingSPV = await this.spvModel.findById(assetData.spvId);
    if (!existingSPV) {
      throw new NotFoundException("SPV not found");
    }
    // Check if the SPV already has an asset
    const existingSPVAsset = await this.assetModel.findOne({
      spvId: assetData.spvId,
    });
    if (existingSPVAsset) {
      throw new ConflictException(
        "SPV already has an asset. Only one asset per SPV is allowed.",
      );
    }

    // Check if the asset name already exists globally
    const existingAsset = await this.assetModel.findOne({
      name: assetData.name,
    });
    if (existingAsset) {
      throw new ConflictException(
        `Asset with this name ${assetData.name} already exists`,
      );
    }

    // Validate required fields
    const requiredFields = {
      class: "Asset class",
      category: "Asset category",
      stage: "Asset stage",
      style: "Asset style",
      name: "Asset name",
      about: "Asset description",
      currency: "Currency Type",
      instrumentType: "Instrument Type",
      country: "Country",
      state: "State",
      city: "City",
      spvId: "SPV ID",
      landmark: "Landmark",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!assetData[field as keyof CreateAssetDto]) {
        throw new BadRequestException(`${label} is required`);
      }
    }

    // Create metadata (simplified - Country/State utilities may not exist in NestJS version)
    const metadata = {
      places: {
        [assetData.country]: assetData.country,
        [assetData.state]: assetData.state,
      },
    };

    // Create new asset with basic details
    const asset = new this.assetModel({
      issuerId: issuerId,
      spvId: assetData.spvId,
      class: assetData.class,
      category: assetData.category,
      stage: assetData.stage,
      style: assetData.style,
      name: assetData.name,
      about: assetData.about,
      currency: assetData.currency,
      instrumentType: assetData.instrumentType,
      country: assetData.country,
      state: assetData.state,
      city: assetData.city,
      landmark: assetData.landmark,
      metadata: metadata,
    });

    const savedAsset = await asset.save();

    // Insert default reserve fee and insurance fee using insertMany
    const feeConfigsToInsert = [
      {
        assetId: savedAsset._id,
        issuerId: issuerId,
        ...STATIC_RESERVE_FEE_CONFIG,
      },
      {
        assetId: savedAsset._id,
        issuerId: issuerId,
        ...STATIC_INSURANCE_FEE_CONFIG,
      },
    ];

    await this.assetFeeConfigModel.insertMany(feeConfigsToInsert);

    return savedAsset;
  }

  async getAllAssets(
    issuerId: string,
  ): Promise<{ data: AssetDocument[]; message: string }> {
    const assets = await this.assetModel.find({ issuerId: issuerId });
    return {
      data: assets,
      message: "Assets fetched successfully",
    };
  }

  async getAssetById(assetId: string): Promise<AssetDocument> {
    const asset = await this.assetModel.findById(assetId);
    if (!asset) {
      throw new NotFoundException("Asset not found");
    }
    return asset;
  }

  async updateAsset(
    assetId: string,
    updateData: UpdateAssetDto,
  ): Promise<AssetDocument> {
    const { status } = updateData;

    console.log("Update Asset Data:", updateData.tokenInformation);

    // Check if asset can be set to inactive
    // TODO: Import Order model when available
    // if (status === AssetStatus.INACTIVE) {
    //   const orders = await Order.find({ assetId });
    //   if (orders.length > 0) {
    //     throw new BadRequestException(
    //       "Asset posses orders and can't be inactive",
    //     );
    //   }
    // }

    const asset = await this.assetModel.findById(assetId);
    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    let places: Record<string, any> | null = null;

    const isCountryChanged = asset?.country !== updateData?.country;
    const isStateChanged = asset?.state !== updateData?.state;

    // Update metadata if country or state changed
    // TODO: Implement Country and State utility classes if needed
    // For now, using simple string mapping
    if (isCountryChanged || isStateChanged) {
      const metadata = {
        places: {
          ...(updateData?.country && {
            [updateData.country]: updateData.country,
          }),
          ...(updateData?.state && { [updateData.state]: updateData.state }),
        },
      };
      updateData.metadata = metadata;
    }

    // Handle location updates
    // TODO: Implement NearByLocationServices.getPlaces when available
    if (updateData?.latitude && updateData?.longitude) {
      if (
        (asset?.latitude !== updateData?.latitude &&
          asset?.longitude !== updateData?.longitude) ||
        (!asset?.latitude && !asset?.longitude)
      ) {
        // places = await NearByLocationServices.getPlaces({
        //   lat: updateData?.latitude.toString(),
        //   lng: updateData?.longitude.toString(),
        //   assetId: assetId,
        // });
        // For now, we'll skip this and handle it later
      }
    }

    let updatedTokenInformation = updateData?.tokenInformation;

    // Check if any token information fields are being updated
    if (updatedTokenInformation) {
      const isTokenInformationManipulated: boolean = (
        Object.keys(updatedTokenInformation) as Array<keyof ITokenInformation>
      ).some((key) => {
        return updatedTokenInformation[key] !== asset.tokenInformation?.[key];
      });
      console.log(
        "isTokenInformationManipulated",
        isTokenInformationManipulated,
      );

      (
        Object.keys(updatedTokenInformation) as Array<keyof ITokenInformation>
      ).forEach((key) => {
        if (updatedTokenInformation[key] !== asset.tokenInformation?.[key]) {
          console.log(`Changed: ${key}`, {
            old: asset.tokenInformation?.[key],
            new: updatedTokenInformation[key],
          });
        }
      });

      if (isTokenInformationManipulated) {
        const isTokenSupplyChanged =
          updatedTokenInformation?.tokenSupply !==
          asset.tokenInformation?.tokenSupply;
        const isTokenPriceChanged =
          updatedTokenInformation?.tokenPrice !==
          asset.tokenInformation?.tokenPrice;

        if (isTokenSupplyChanged) {
          updatedTokenInformation.availableTokensToBuy =
            updatedTokenInformation.tokenSupply;
        }

        if (isTokenSupplyChanged || isTokenPriceChanged) {
          if (
            (!asset?.totalNumberOfSfts ||
              !asset?.pricePerSft ||
              !asset?.basePropertyValue) &&
            !updateData.totalNumberOfSfts &&
            !updateData.pricePerSft
          ) {
            throw new BadRequestException(
              "You can't modify token supply and price without total number of sfts, price per sft and base property value(Investment Details)",
            );
          }

          // TODO: Import Order model when available
          // const orders: IOrderDocument[] = await Order.find({ assetId });
          // if (orders.length > 0) {
          //   throw new BadRequestException(
          //     "Token supply and price cannot be modified as asset has existing orders",
          //   );
          // }
        }

        // Merge token information
        updateData.tokenInformation = {
          ...(asset.tokenInformation
            ? JSON.parse(JSON.stringify(asset.tokenInformation))
            : {}),
          ...updatedTokenInformation,
        };

        console.log("Merged Token Information:", updateData.tokenInformation);
      }
    }

    // Calculate base property value and total property value after fees
    if (updateData?.totalNumberOfSfts && updateData?.pricePerSft) {
      const basePropertyValue =
        updateData.totalNumberOfSfts * updateData.pricePerSft;

      const fees = await this.assetFeeConfigModel.find({
        assetId: assetId,
        status: true,
      });

      if (!fees || fees.length === 0) {
        throw new NotFoundException("Asset fees not found");
      }

      let totalFee: number = 0;

      for (const fee of fees) {
        if (fee.isPercentage && fee.value < 99) {
          totalFee += (fee.value / 100) * basePropertyValue;
        } else {
          totalFee += fee.value;
        }
      }

      const totalPropertyValueAfterFees = basePropertyValue + totalFee;

      updateData.basePropertyValue = basePropertyValue;
      updateData.totalPropertyValueAfterFees = totalPropertyValueAfterFees;
    }

    // Update the asset
    const updatedAsset = await this.assetModel.findByIdAndUpdate(
      assetId,
      updateData,
      {
        new: true,
      },
    );

    if (!updatedAsset) {
      throw new NotFoundException("Asset not found after update");
    }

    // Return with nearby locations if they were fetched
    // For now, we'll return the updated asset without nearby locations
    // until NearByLocationServices is implemented
    return updatedAsset;
  }

  async getAssetByIdWithDetails(
    assetId: string,
    issuerId?: string,
  ): Promise<any> {
    const objectId = new Types.ObjectId(assetId);

    const pipeline: PipelineStage[] = [
      { $match: { _id: objectId } },

      // Lookup company
      {
        $lookup: {
          from: "spvs",
          let: { spvId: "$spvId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$spvId"] } } },
            {
              $project: {
                name: 1,
                currency: 1,
                daoConfiguration: 1,
              },
            },
          ],
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

      // Lookup FAQs
      {
        $lookup: {
          from: "faqs",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "faqs",
        },
      },

      // Lookup tenants
      {
        $lookup: {
          from: "assettenants",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "tenants",
        },
      },

      // Lookup documents
      {
        $lookup: {
          from: "assetdocuments",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "documents",
        },
      },

      // Lookup amenities
      {
        $lookup: {
          from: "amenities",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "amenities",
        },
      },

      // Lookup expenses
      {
        $lookup: {
          from: "assetExpenses",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "expenses",
        },
      },

      // Lookup features
      {
        $lookup: {
          from: "features",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "features",
        },
      },

      // Lookup risk factors
      {
        $lookup: {
          from: "riskfactors",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "riskFactors",
        },
      },

      // Lookup risk disclosures
      {
        $lookup: {
          from: "riskdisclosures",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "riskDisclosures",
        },
      },

      // Lookup terms and conditions
      {
        $lookup: {
          from: "assettermsandconditions",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "termsAndConditions",
        },
      },

      // Lookup exit opportunities
      {
        $lookup: {
          from: "exitopportunities",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "exitOpportunities",
        },
      },

      // Lookup additional taxes
      {
        $lookup: {
          from: "assetAdditionalTaxes",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "additionalTaxes",
        },
      },

      // Lookup due diligence legal
      {
        $lookup: {
          from: "assetduediligencelegals",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceLegal",
        },
      },

      // Lookup due diligence structure
      {
        $lookup: {
          from: "assetduediligencestructures",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceStructure",
        },
      },

      // Lookup due diligence valuation
      {
        $lookup: {
          from: "assetduediligencevaluations",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "dueDiligenceValuation",
        },
      },

      // Lookup nearby locations
      {
        $lookup: {
          from: "nearbylocations",
          localField: "_id",
          foreignField: "assetId",
          pipeline: [{ $project: { assetId: 0 } }],
          as: "nearByLocations",
        },
      },
    ];

    const result = await this.assetModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      throw new NotFoundException("Asset not found");
    }

    const asset = result[0];

    // Fetch asset fees and group by type
    const assetFees = await this.assetFeeConfigModel
      .find({
        assetId: objectId,
      })
      .lean();

    const assetFeesByTypes: Record<string, any[]> = assetFees.reduce(
      (acc: Record<string, any[]>, fee: any) => {
        const feeType = fee.type.toLowerCase();
        if (!acc[feeType]) {
          acc[feeType] = [];
        }
        acc[feeType].push(fee);
        return acc;
      },
      Object.values(FeeType).reduce(
        (obj, type) => {
          obj[type.toLowerCase()] = [];
          return obj;
        },
        {} as Record<string, any[]>,
      ),
    );

    // Group nearby locations by type
    const nearByLocationsByType: Record<string, any[]> = {};
    if (asset.nearByLocations && asset.nearByLocations.length > 0) {
      asset.nearByLocations.forEach((location: any) => {
        const type = location.locationType;
        if (!nearByLocationsByType[type]) {
          nearByLocationsByType[type] = [];
        }
        nearByLocationsByType[type].push(location);
      });
    }

    // Combine the asset data with the related arrays
    const enrichedAsset = {
      ...asset,
      company: asset.company || null,
      fees: assetFeesByTypes || {},
      nearByLocations: nearByLocationsByType || {},
      dueDiligence: {
        legal: asset.dueDiligenceLegal || [],
        structure: asset.dueDiligenceStructure || [],
        valuation: asset.dueDiligenceValuation || [],
      },
      investors: [], // TODO: Implement when Order and Investor models are available
      totalFundsRaised: 0, // TODO: Implement when Order model is available
      completedOrdersCount: 0, // TODO: Implement when Order model is available
      dueDiligenceLegal: undefined,
      dueDiligenceStructure: undefined,
      dueDiligenceValuation: undefined,
    };

    // Clean up undefined fields
    Object.keys(enrichedAsset).forEach((key) => {
      if (enrichedAsset[key] === undefined) {
        delete enrichedAsset[key];
      }
    });

    return enrichedAsset;
  }

  async checkTokenSymbol(
    tokenSymbol: string,
  ): Promise<{ available: boolean; message: string }> {
    const existingAsset = await this.assetModel.findOne({
      "tokenInformation.tokenSymbol": tokenSymbol,
    });

    const available = !existingAsset;

    return {
      available,
      message: available
        ? `Token symbol "${tokenSymbol}" is available.`
        : `Token symbol "${tokenSymbol}" is already taken by another asset.`,
    };
  }

  async assignTokenSymbol(
    tokenSymbol: string,
    assetId: string,
  ): Promise<AssetDocument> {
    // Check if token symbol already exists
    const existingAsset = await this.assetModel.findOne({
      "tokenInformation.tokenSymbol": tokenSymbol,
    });

    if (existingAsset) {
      throw new ConflictException(
        `Token symbol "${tokenSymbol}" already exists. Please choose another.`,
      );
    }

    // Update asset with new token symbol
    const updatedAsset = await this.assetModel.findByIdAndUpdate(
      assetId,
      { "tokenInformation.tokenSymbol": tokenSymbol },
      { new: true },
    );

    if (!updatedAsset) {
      throw new NotFoundException("Asset not found.");
    }

    return updatedAsset;
  }

  async getAdminAssetListing(
    queryParams: AdminAssetListingQueryDto,
    issuerId: string,
  ): Promise<AdminAssetListingResponse> {
    if (!mongoose.Types.ObjectId.isValid(issuerId)) {
      throw new BadRequestException("Invalid issuer ID format");
    }

    const matchStage: Record<string, any> = {
      issuerId: new mongoose.Types.ObjectId(issuerId),
    };

    console.log("Issuer ID ObjectId:", matchStage.issuerId);

    // Search filter
    if (queryParams.search) {
      const search = queryParams.search.trim();
      const searchRegex = new RegExp(search, "i");
      matchStage.$or = [{ name: { $regex: searchRegex } }];

      if (mongoose.Types.ObjectId.isValid(search)) {
        matchStage.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
    }

    // Status filter
    if (queryParams.status) {
      matchStage.status = queryParams.status;
    }

    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      // 1. Match stage for filtering
      { $match: matchStage },

      // 2. Lookup company
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

      // 3. Lookup related collections for completed steps calculation
      {
        $lookup: {
          from: "features",
          localField: "_id",
          foreignField: "assetId",
          as: "features",
        },
      },
      {
        $lookup: {
          from: "amenities",
          localField: "_id",
          foreignField: "assetId",
          as: "amenities",
        },
      },
      {
        $lookup: {
          from: "faqs",
          localField: "_id",
          foreignField: "assetId",
          as: "faqs",
        },
      },
      {
        $lookup: {
          from: "assettermsandconditions",
          localField: "_id",
          foreignField: "assetId",
          as: "termsAndConditions",
        },
      },
      {
        $lookup: {
          from: "assetdocuments",
          localField: "_id",
          foreignField: "assetId",
          as: "documents",
        },
      },
      {
        $lookup: {
          from: "documenttemplates",
          localField: "_id",
          foreignField: "assetId",
          as: "signatureDocuments",
        },
      },
      {
        $lookup: {
          from: "nearbylocations",
          localField: "_id",
          foreignField: "assetId",
          as: "nearByLocations",
        },
      },

      // 4. Calculate completed steps
      {
        $addFields: {
          completedSteps: {
            $filter: {
              input: [
                // Step 1: Asset Information (Basic Details)
                {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$name", null] },
                        { $ne: ["$name", ""] },
                        { $ne: ["$class", null] },
                        { $ne: ["$category", null] },
                        { $ne: ["$companyId", null] },
                      ],
                    },
                    "asset_information",
                    null,
                  ],
                },
                // Step 2: Token Information
                {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$tokenInformation.tokenSymbol", null] },
                        { $ne: ["$tokenInformation.tokenSymbol", ""] },
                        { $gt: ["$tokenInformation.tokenSupply", 0] },
                        { $gt: ["$tokenInformation.tokenPrice", 0] },
                      ],
                    },
                    "token_information",
                    null,
                  ],
                },
                // Step 3: Media & Documents
                {
                  $cond: [
                    {
                      $or: [
                        {
                          $and: [
                            { $ne: ["$media.imageURL", null] },
                            { $ne: ["$media.imageURL", ""] },
                          ],
                        },
                        {
                          $gt: [
                            { $size: { $ifNull: ["$media.gallery", []] } },
                            0,
                          ],
                        },
                        { $gt: [{ $size: "$documents" }, 0] },
                      ],
                    },
                    "media_documents",
                    null,
                  ],
                },
                // Step 4: Investment Details
                {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$totalNumberOfSfts", 0] },
                        { $gt: ["$pricePerSft", 0] },
                        { $gt: ["$basePropertyValue", 0] },
                      ],
                    },
                    "investment_details",
                    null,
                  ],
                },
                // Step 5: Rent Information
                {
                  $cond: [
                    {
                      $or: [
                        { $gt: ["$rentalInformation.rentPerSft", 0] },
                        { $gt: ["$rentalInformation.netMonthlyRent", 0] },
                        { $gt: ["$rentalInformation.grossMonthlyRent", 0] },
                      ],
                    },
                    "rent_information",
                    null,
                  ],
                },
                // Step 6: Escrow & Legal Details
                {
                  $cond: [
                    {
                      $or: [
                        {
                          $and: [
                            { $ne: ["$escrowInformation.escrowBank", null] },
                            { $ne: ["$escrowInformation.escrowBank", ""] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$legalAdivisory.name", null] },
                            { $ne: ["$legalAdivisory.name", ""] },
                          ],
                        },
                      ],
                    },
                    "escrow_legal",
                    null,
                  ],
                },
                // Step 7: Features & Amenities
                {
                  $cond: [
                    {
                      $or: [
                        { $gt: [{ $size: "$features" }, 0] },
                        { $gt: [{ $size: "$amenities" }, 0] },
                      ],
                    },
                    "features_amenities",
                    null,
                  ],
                },
                // Step 8: Location & Places
                {
                  $cond: [
                    {
                      $or: [
                        {
                          $and: [
                            { $ne: ["$latitude", null] },
                            { $ne: ["$longitude", null] },
                          ],
                        },
                        { $gt: [{ $size: "$nearByLocations" }, 0] },
                      ],
                    },
                    "location_places",
                    null,
                  ],
                },
                // Step 9: T&C, FAQ
                {
                  $cond: [
                    {
                      $or: [
                        { $gt: [{ $size: "$faqs" }, 0] },
                        { $gt: [{ $size: "$termsAndConditions" }, 0] },
                      ],
                    },
                    "tc_faq",
                    null,
                  ],
                },
                // Step 10: Investors Signature
                {
                  $cond: [
                    { $gt: [{ $size: "$signatureDocuments" }, 0] },
                    "investors_signature",
                    null,
                  ],
                },
              ],
              as: "step",
              cond: { $ne: ["$$step", null] },
            },
          },
        },
      },

      // 5. Add completed steps count
      {
        $addFields: {
          completedStepsCount: { $size: "$completedSteps" },
          totalSteps: 10,
        },
      },

      // 6. Project required fields
      {
        $project: {
          _id: 1,
          name: 1,
          landmark: 1,
          city: 1,
          state: 1,
          country: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          totalTokens: "$tokenInformation.tokenSupply",
          availableTokensToBuy: "$tokenInformation.availableTokensToBuy",
          blockchainProjectAddress:
            "$tokenInformation.blockchainProjectAddress",
          percentageOfTokensSold: {
            $cond: [
              { $eq: ["$tokenInformation.tokenSupply", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$tokenInformation.tokenSupply",
                          "$tokenInformation.availableTokensToBuy",
                        ],
                      },
                      "$tokenInformation.tokenSupply",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
          companyName: "$company.name",
          completedSteps: 1,
          completedStepsCount: 1,
          totalSteps: 1,
        },
      },

      // 7. Sort by createdAt descending
      { $sort: { createdAt: -1 } },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await this.assetModel.aggregate(countPipeline).exec();
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
    const assets = await this.assetModel.aggregate(paginatedPipeline).exec();

    // TODO: Add order statistics when Order model is available
    // For now, return assets with default order counts
    const assetsWithStats: AdminAssetListingItem[] = assets.map(
      (asset: any) => ({
        ...asset,
        orderCount: 0, // TODO: Implement when Order model is available
        uniqueInvestorCount: 0, // TODO: Implement when Order model is available
      }),
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      assets: assetsWithStats,
      currentPage: page,
      page,
      limit,
      totalPages,
      hasNextPage: totalCount > page * limit,
      hasPreviousPage: page > 1,
      totalCount,
    };
  }
}
