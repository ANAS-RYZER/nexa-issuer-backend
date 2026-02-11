import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  IssuerApplication,
  IssuerApplicationDocument,
  ApplicationStatus,
} from './schemas/issuer-application.schema';
import {
  CreateIssuerApplicationDto,
  UpdateIssuerApplicationDto,
  QueryIssuerApplicationDto,
  PaginatedResponseDto,
} from './dto';

@Injectable()
export class IssuerApplicationsService {
  constructor(
    @InjectModel(IssuerApplication.name)
    private readonly issuerApplicationModel: Model<IssuerApplicationDocument>,
  ) {}

  /**
   * Generate a unique application ID
   */
  private generateApplicationId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `APP-${timestamp}-${randomPart}`;
  }

  /**
   * Create a new issuer application
   */
  async create(
    createDto: CreateIssuerApplicationDto,
    userId: string,
  ): Promise<IssuerApplicationDocument> {
    const applicationId = this.generateApplicationId();

    const application = new this.issuerApplicationModel({
      ...createDto,
      applicationId,
      userId,
      status: ApplicationStatus.PENDING,
    });

    return application.save();
  }

  /**
   * Find all applications with pagination and filtering
   */
  async findAll(
    queryDto: QueryIssuerApplicationDto,
  ): Promise<PaginatedResponseDto<IssuerApplicationDocument>> {
    const {
      search,
      status,
      assetCategory,
      countryOfIncorporation,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    // Build filter query
    const filter: FilterQuery<IssuerApplicationDocument> = {};

    if (status) {
      filter.status = status;
    }

    if (assetCategory) {
      filter.assetCategory = assetCategory;
    }

    if (countryOfIncorporation) {
      filter.countryOfIncorporation = {
        $regex: countryOfIncorporation,
        $options: 'i',
      };
    }

    if (search) {
      filter.$or = [
        { legalEntityName: { $regex: search, $options: 'i' } },
        { shortAssetDescription: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [applications, total] = await Promise.all([
      this.issuerApplicationModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.issuerApplicationModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find applications by userId
   */
  async findByUserId(
    userId: string,
    queryDto: QueryIssuerApplicationDto,
  ): Promise<PaginatedResponseDto<IssuerApplicationDocument>> {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: FilterQuery<IssuerApplicationDocument> = { userId };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      this.issuerApplicationModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.issuerApplicationModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find application by ID
   */
  async findById(id: string): Promise<IssuerApplicationDocument> {
    const application = await this.issuerApplicationModel
      .findById(id)
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Find application by applicationId (e.g., APP-XXXXX-XXXX)
   */
  async findByApplicationId(
    applicationId: string,
  ): Promise<IssuerApplicationDocument> {
    const application = await this.issuerApplicationModel
      .findOne({ applicationId })
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Application with Application ID ${applicationId} not found`,
      );
    }

    return application;
  }

  /**
   * Update an application
   */
  async update(
    id: string,
    updateDto: UpdateIssuerApplicationDto,
  ): Promise<IssuerApplicationDocument> {
    const application = await this.issuerApplicationModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Update application status
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<IssuerApplicationDocument> {
    const updateData: Partial<IssuerApplication> = {
      status,
      reviewedAt: new Date(),
    };

    if (notes) {
      if (status === ApplicationStatus.REJECTED) {
        updateData.rejectionReason = notes;
      } else {
        updateData.reviewNotes = notes;
      }
    }

    const application = await this.issuerApplicationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Delete an application
   */
  async remove(id: string): Promise<void> {
    const result = await this.issuerApplicationModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
  }

  /**
   * Get application statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    recentCount: number;
  }> {
    const [total, statusAgg, categoryAgg, recentCount] = await Promise.all([
      this.issuerApplicationModel.countDocuments().exec(),
      this.issuerApplicationModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.issuerApplicationModel.aggregate([
        { $group: { _id: '$assetCategory', count: { $sum: 1 } } },
      ]),
      this.issuerApplicationModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    statusAgg.forEach((item) => {
      byStatus[item._id] = item.count;
    });

    const byCategory: Record<string, number> = {};
    categoryAgg.forEach((item) => {
      byCategory[item._id] = item.count;
    });

    return {
      total,
      byStatus,
      byCategory,
      recentCount,
    };
  }
}
