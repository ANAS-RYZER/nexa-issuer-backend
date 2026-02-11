import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CompanyStatus, SPV, SPVDocument } from "./schemas/spv.schema";
import {
  CreateSPVDto,
  UpdateSPVDto,
  BoardMemberDto,
  UpdateBoardMemberDto,
} from "./dto/spv.dto";

@Injectable()
export class SPVService {
  constructor(
    @InjectModel(SPV.name)
    private readonly spvModel: Model<SPVDocument>,
  ) {}

  /**
   * Create a new SPV with edge case handling
   */
  async create(createDto: CreateSPVDto, userId: string): Promise<SPVDocument> {
    // Edge Case 1: Check if SPV with same name already exists
    const existingSPV = await this.spvModel
      .findOne({ name: createDto.name })
      .collation({ locale: "en", strength: 2 }) // Case-insensitive
      .exec();

    if (existingSPV) {
      throw new BadRequestException(
        `SPV with name "${createDto.name}" already exists`,
      );
    }

    // Edge Case 2: Validate formation date is not in the future
    const formationDate = new Date(createDto.formationDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (formationDate > today) {
      throw new BadRequestException("Formation date cannot be in the future");
    }

    // Edge Case 3: Validate formation date is not too old (reasonable business constraint)
    const minDate = new Date("1900-01-01");
    if (formationDate < minDate) {
      throw new BadRequestException("Formation date cannot be before 1900");
    }

    // Edge Case 4: Validate board members if provided
    if (createDto.boardMembers && createDto.boardMembers.length > 0) {
      // Check for duplicate emails within board members
      const emails = createDto.boardMembers.map((member) =>
        member.email.toLowerCase(),
      );
      const uniqueEmails = new Set(emails);

      if (emails.length !== uniqueEmails.size) {
        throw new BadRequestException(
          "Duplicate email addresses found in board members",
        );
      }

      // Edge Case 5: Ensure at least two Directors are present
      if (createDto.boardMembers.length < 2) {
        throw new BadRequestException(
          "At least two board members must have the role of Director",
        );
      }

      // Edge Case 7: Validate phone numbers format
      const phoneRegex = /^[0-9]{7,15}$/;
      for (const member of createDto.boardMembers) {
        if (!phoneRegex.test(member.phoneNumber.replace(/[\s\-()]/g, ""))) {
          throw new BadRequestException(
            `Invalid phone number format for ${member.fullName}`,
          );
        }
      }
    }

    // Edge Case 8: Validate DAO configuration if provided
    if (createDto.daoConfiguration) {
      const dao = createDto.daoConfiguration;

      // Validate percentages
      if (dao.proposalThresholdPercent !== undefined) {
        if (
          dao.proposalThresholdPercent < 0 ||
          dao.proposalThresholdPercent > 100
        ) {
          throw new BadRequestException(
            "Proposal threshold percent must be between 0 and 100",
          );
        }
      }

      if (dao.quorumPercent !== undefined) {
        if (dao.quorumPercent < 0 || dao.quorumPercent > 100) {
          throw new BadRequestException(
            "Quorum percent must be between 0 and 100",
          );
        }
      }

      // Validate voting period
      if (dao.votingPeriod) {
        const totalHours =
          (dao.votingPeriod.days || 0) * 24 + (dao.votingPeriod.hours || 0);

        if (totalHours < 1) {
          throw new BadRequestException(
            "Voting period must be at least 1 hour",
          );
        }

        if (totalHours > 8760) {
          // 365 days
          throw new BadRequestException("Voting period cannot exceed 365 days");
        }
      }
    }

    // Edge Case 9: Validate business purpose length
    if (createDto.businessPurpose.length < 10) {
      throw new BadRequestException(
        "Business purpose must be at least 10 characters long",
      );
    }

    if (createDto.businessPurpose.length > 2000) {
      throw new BadRequestException(
        "Business purpose cannot exceed 2000 characters",
      );
    }

    // Edge Case 10: Validate OnchainAddress format if provided
    if (createDto.OnchainAddress) {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/; // Ethereum address format
      if (!addressRegex.test(createDto.OnchainAddress)) {
        throw new BadRequestException(
          "Invalid blockchain address format. Must be a valid Ethereum address",
        );
      }

      // Check if OnchainAddress already exists
      const existingAddress = await this.spvModel
        .findOne({ OnchainAddress: createDto.OnchainAddress })
        .exec();

      if (existingAddress) {
        throw new BadRequestException(
          `SPV with onchain address "${createDto.OnchainAddress}" already exists`,
        );
      }
    }

    try {
      // Create the SPV with userId and all default values
      const spvData = {
        userId,
        ...createDto,
        // Ensure all optional fields are initialized
        OnchainAddress: createDto.OnchainAddress || null,
        blockchainCompanyId: createDto.blockchainCompanyId || null,
        logo: createDto.logo || null,
        memoAndTerms: createDto.memoAndTerms || {
          investmentMemorandum: null,
          termsAndConditions: null,
          riskFactor: null,
          investmentStrategy: null,
        },
        escrowBankDetails: createDto.escrowBankDetails || {
          bankName: null,
          accountType: null,
          accountNumber: null,
          routingNumber: null,
          ifscCode: null,
          bankStatement: null,
        },
        legalDocuments: createDto.legalDocuments || {
          llcOperatingAgreement: null,
          articlesOfAssociation: null,
          memorandumOfAssociation: null,
          otherDocuments: null,
        },
        boardMembers: createDto.boardMembers || [],
        daoConfiguration: createDto.daoConfiguration || {
          daoName: null,
          tokenSymbol: null,
          blockchain: null,
          governanceModel: null,
          proposalThresholdPercent: null,
          quorumPercent: null,
          votingPeriod: {
            days: null,
            hours: null,
          },
          governanceRights: {
            votingRights: false,
            proposalCreation: false,
            adminVotePower: false,
          },
          issuerRepSignature: false,
        },
        completedSteps: createDto.completedSteps || [],
      };

      const spv = new this.spvModel(spvData);
      const savedSPV = await spv.save();

      // Return with all fields populated
      return savedSPV.toObject();
    } catch (error) {
      // Edge Case 11: Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(
          `A SPV with this ${field} already exists`,
        );
      }

      // Edge Case 12: Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(", ")}`,
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Update SPV with comprehensive validation
   */
  async update(id: string, updateDto: UpdateSPVDto): Promise<SPVDocument> {
    // Edge Case 1: Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    try {
      // Perform update
      const updatedSPV = await this.spvModel
        .findByIdAndUpdate(
          id,
          { $set: updateDto },
          {
            new: true,
            runValidators: true,
            context: "query",
          },
        )
        .exec();

      if (!updatedSPV) {
        throw new NotFoundException(`SPV with ID ${id} not found`);
      }

      // Return with all fields populated
      return updatedSPV.toObject();
    } catch (error) {
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(
          `A SPV with this ${field} already exists`,
        );
      }

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(", ")}`,
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get paginated SPV list with aggregation (AUM, investor count, etc.)
   * Optimized with MongoDB aggregation pipeline
   */
  async getSPVListByAggregation(
    filters: {
      search?: string;
      type?: string[];
      status?: string;
      userId?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    spvs: any[];
    totalCount: number;
    pagination: any;
  }> {
    const matchStage: Record<string, any> = {};

    // Filter by userId (authenticated user's SPVs only)
    if (filters.userId) {
      matchStage.userId = filters.userId;
    }

    // Filter by type(s)
    if (filters.type && filters.type.length > 0) {
      if (filters.type.length === 1) {
        matchStage.type = filters.type[0];
      } else {
        matchStage.type = { $in: filters.type };
      }
    }

    // Filter by status (case-insensitive)
    if (filters.status) {
      const statusRegex = new RegExp(`^${filters.status.trim()}$`, "i");
      matchStage.status = { $regex: statusRegex };
    }

    // Search filter (name, type, or _id)
    if (filters.search) {
      const search = filters.search.trim();
      const searchRegex = new RegExp(search, "i");

      matchStage.$or = [
        { name: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
      ];

      // If search is a valid ObjectId, include _id search
      if (Types.ObjectId.isValid(search)) {
        matchStage.$or.push({ _id: new Types.ObjectId(search) });
      }
    }

    // Aggregation pipeline with proper TypeScript types
    const pipeline: any[] = [
      // 1. Filter SPVs
      { $match: matchStage },

      // 2. Lookup assets for each SPV
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "companyId",
          as: "assets",
        },
      },

      // 3. Calculate AUM and extract asset IDs
      {
        $addFields: {
          aum: {
            $sum: {
              $map: {
                input: "$assets",
                as: "asset",
                in: {
                  $ifNull: ["$$asset.totalPropertyValueAfterFees", 0],
                },
              },
            },
          },
          assetIds: {
            $map: {
              input: "$assets",
              as: "asset",
              in: "$$asset._id",
            },
          },
        },
      },

      // 4. Lookup orders to count unique investors
      {
        $lookup: {
          from: "orders",
          let: { assetIds: "$assetIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$assetId", "$$assetIds"],
                },
              },
            },
            {
              $group: {
                _id: "$investorId",
              },
            },
          ],
          as: "uniqueInvestors",
        },
      },

      // 5. Calculate counts and format data
      {
        $addFields: {
          totalInvestors: { $size: "$uniqueInvestors" },
          completedStepsCount: {
            $cond: {
              if: { $isArray: "$completedSteps" },
              then: { $size: "$completedSteps" },
              else: 0,
            },
          },
        },
      },

      // 6. Project only required fields
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          status: 1,
          logo: 1,
          currency: 1,
          OnchainAddress: 1,
          aum: 1,
          totalInvestors: 1,
          completedSteps: 1,
          completedStepsCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      // 7. Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 as const },
      },
    ];

    // Get total count (before pagination)
    const countPipeline: any[] = [...pipeline, { $count: "total" }];
    const countResult = await this.spvModel.aggregate(countPipeline).exec();
    const totalCount = countResult[0]?.total || 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute aggregation
    const spvs = await this.spvModel.aggregate(pipeline).exec();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      spvs,
      totalCount,
      pagination,
    };
  }

  /**
   * Get all active SPV names WITHOUT assets (for asset creation dropdown)
   * This is the authenticated version matching your existing pattern
   */
  async getSPVNamesWithoutAssets(
    userId: string,
  ): Promise<Array<{ _id: string; name: string }>> {
    let spvsWithAssets: any[] = [];

    try {
      // Get all SPV IDs that have at least one asset
      const mongoose = await import("mongoose");
      const Asset = mongoose.model("Asset");
      spvsWithAssets = await Asset.distinct("companyId").exec();

      console.log("SPVs with assets IDs:", spvsWithAssets);
    } catch (error) {
      // Asset model doesn't exist yet, return all active SPVs
      console.log("Asset model not found, returning all active SPVs");
    }

    // Find active SPVs that are NOT in the spvsWithAssets list
    const query: any = {
      status: CompanyStatus.ACTIVE,
      _id: { $nin: spvsWithAssets },
      userId: userId,
    };

    // Optimized query with lean() for better performance
    const spvs = await this.spvModel
      .find(query)
      .select("_id name") // Only select needed fields
      .sort({ name: 1 }) // Sort alphabetically
      .lean() // Return plain JavaScript objects (faster)
      .exec();

    if (!spvs || spvs.length === 0) {
      throw new NotFoundException("No SPVs found without assets");
    }

    // Convert ObjectId to string for consistent API response
    return spvs.map((spv) => ({
      _id: spv._id.toString(),
      name: spv.name,
    }));
  }

  /**
   * Get all SPV names (optimized for dropdown/selection)
   * Returns only _id and name for better performance
   */
  async getAllSPVNames(filters?: {
    status?: string;
    userId?: string;
    excludeWithAssets?: boolean;
  }): Promise<Array<{ _id: string; name: string }>> {
    const query: any = {};

    // Filter by status (default to ACTIVE if not specified)
    if (filters?.status) {
      query.status = filters.status;
    } else {
      query.status = "ACTIVE"; // Default to active SPVs
    }

    // Filter by user if provided
    if (filters?.userId) {
      query.userId = filters.userId;
    }

    // If excluding SPVs with assets
    if (filters?.excludeWithAssets) {
      try {
        // Try to get Asset model (if it exists)
        const mongoose = await import("mongoose");
        const Asset = mongoose.model("Asset");

        // Get all SPV IDs that have assets
        const spvsWithAssets = await Asset.distinct("companyId").exec();

        // Exclude those SPVs
        query._id = { $nin: spvsWithAssets };
      } catch (error) {
        // Asset model doesn't exist yet, skip this filter
        console.log("Asset model not found, skipping asset filter");
      }
    }

    // Optimized query with lean() for better performance
    const spvs = await this.spvModel
      .find(query)
      .select("_id name") // Only select needed fields
      .sort({ name: 1 }) // Sort alphabetically
      .lean() // Return plain JavaScript objects (faster)
      .exec();

    if (!spvs || spvs.length === 0) {
      return []; // Return empty array instead of throwing error
    }

    // Convert ObjectId to string for consistent API response
    return spvs.map((spv) => ({
      _id: spv._id.toString(),
      name: spv.name,
    }));
  }

  /**
   * Get all active SPV names for the authenticated user
   */
  async getUserSPVNames(
    userId: string,
  ): Promise<Array<{ _id: string; name: string }>> {
    return this.getAllSPVNames({
      status: "ACTIVE",
      userId,
    });
  }

  /**
   * Get SPV count by status
   */
  async getSPVCountByStatus(userId?: string): Promise<Record<string, number>> {
    const match: any = userId ? { userId } : {};

    const result = await this.spvModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const countByStatus: Record<string, number> = {};
    result.forEach((item) => {
      countByStatus[item._id] = item.count;
    });

    return countByStatus;
  }

  /**
   * Update SPV status only
   */
  async updateStatus(id: string, status: string): Promise<SPVDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const spv = await this.spvModel.findById(id).exec();
    if (!spv) {
      throw new NotFoundException(`SPV with ID ${id} not found`);
    }

    spv.status = status as any;
    return spv.save();
  }

  /**
   * Find SPV by ID
   * Returns complete SPV details with optimized query
   */
  async findById(id: string): Promise<any> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    // Use lean() for performance
    const spv = await this.spvModel.findById(id).lean().exec();

    if (!spv) {
      throw new NotFoundException(`SPV with ID ${id} not found`);
    }

    return spv;
  }

  /**
   * Get DAO configuration by SPV ID
   * Returns only daoConfiguration and currency fields (optimized query)
   */
  async getDaoBySpvId(id: string): Promise<any> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    // Use lean() for performance and select only required fields
    const spv = await this.spvModel
      .findById(id)
      .select("daoConfiguration currency")
      .lean()
      .exec();

    if (!spv) {
      throw new NotFoundException(`SPV with ID ${id} not found`);
    }

    return spv;
  }

  /**
   * Delete SPV
   */
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const result = await this.spvModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`SPV with ID ${id} not found`);
    }
  }

  private static validateBoardMemberPhone(
    phone: string,
    fullName: string,
  ): void {
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      throw new BadRequestException(
        `Invalid phone number format for ${fullName}`,
      );
    }
  }

  /**
   * Add a board member to an SPV (embedded in document).
   */
  async addBoardMember(spvId: string, dto: BoardMemberDto): Promise<any> {
    if (!Types.ObjectId.isValid(spvId)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const spv = await this.spvModel.findById(spvId).exec();
    if (!spv) {
      throw new NotFoundException(`SPV with ID ${spvId} not found`);
    }

    const emails = (spv.boardMembers || [])
      .map((m) => m.email?.toLowerCase())
      .filter(Boolean);
    const newEmail = dto.email?.toLowerCase();
    if (newEmail && emails.includes(newEmail)) {
      throw new BadRequestException(
        `A board member with email "${dto.email}" already exists for this SPV`,
      );
    }

    SPVService.validateBoardMemberPhone(dto.phoneNumber, dto.fullName);

    const member = {
      fullName: dto.fullName,
      email: dto.email?.toLowerCase().trim(),
      countryCode: dto.countryCode?.trim(),
      phoneNumber: dto.phoneNumber.trim(),
      idNumber: dto.idNumber.trim(),
      idProof: dto.idProof,
      role: dto.role,
    };

    spv.boardMembers = spv.boardMembers || [];
    spv.boardMembers.push(member as any);
    await spv.save();

    return spv.boardMembers[spv.boardMembers.length - 1];
  }

  /**
   * Get all board members of an SPV.
   */
  async getBoardMembers(spvId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(spvId)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const spv = await this.spvModel
      .findById(spvId)
      .select("boardMembers")
      .lean()
      .exec();

    if (!spv) {
      throw new NotFoundException(`SPV with ID ${spvId} not found`);
    }

    return (spv as any).boardMembers || [];
  }

  /**
   * Update a board member by index (0-based).
   */
  async updateBoardMember(
    spvId: string,
    memberIndex: number,
    dto: UpdateBoardMemberDto,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(spvId)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const spv = await this.spvModel.findById(spvId).exec();
    if (!spv) {
      throw new NotFoundException(`SPV with ID ${spvId} not found`);
    }

    const members = spv.boardMembers || [];
    if (memberIndex < 0 || memberIndex >= members.length) {
      throw new BadRequestException(
        `Board member index ${memberIndex} is out of range (0–${members.length - 1})`,
      );
    }

    const existing = members[memberIndex];

    if (dto.email !== undefined) {
      const newEmail = dto.email.toLowerCase().trim();
      const duplicates = members.filter(
        (m, i) => i !== memberIndex && m.email?.toLowerCase() === newEmail,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `A board member with email "${dto.email}" already exists for this SPV`,
        );
      }
      existing.email = newEmail;
    }

    if (dto.phoneNumber !== undefined) {
      SPVService.validateBoardMemberPhone(
        dto.phoneNumber,
        dto.fullName ?? existing.fullName,
      );
      existing.phoneNumber = dto.phoneNumber.trim();
    }

    if (dto.fullName !== undefined) existing.fullName = dto.fullName.trim();
    if (dto.countryCode !== undefined)
      existing.countryCode = dto.countryCode?.trim();
    if (dto.idNumber !== undefined) existing.idNumber = dto.idNumber.trim();
    if (dto.idProof !== undefined) existing.idProof = dto.idProof as any;
    if (dto.role !== undefined) existing.role = dto.role;

    await spv.save();
    return existing;
  }

  /**
   * Delete a board member by index (0-based).
   */
  async deleteBoardMember(spvId: string, memberIndex: number): Promise<void> {
    if (!Types.ObjectId.isValid(spvId)) {
      throw new BadRequestException("Invalid SPV ID format");
    }

    const spv = await this.spvModel.findById(spvId).exec();
    if (!spv) {
      throw new NotFoundException(`SPV with ID ${spvId} not found`);
    }

    const members = spv.boardMembers || [];
    if (memberIndex < 0 || memberIndex >= members.length) {
      throw new BadRequestException(
        `Board member index ${memberIndex} is out of range (0–${members.length - 1})`,
      );
    }

    members.splice(memberIndex, 1);
    spv.boardMembers = members;
    await spv.save();
  }
}
