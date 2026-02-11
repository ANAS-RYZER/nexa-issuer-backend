import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { IssuerApplicationsService } from './issuer-applications.service';
import {
  CreateIssuerApplicationDto,
  QueryIssuerApplicationDto,
} from './dto';
import { JwtAuthGuard } from '../auth_issuer/guards/jwt-auth.guard';
import { AuthIssuerService } from '../auth_issuer/auth_issuer.service';

@Controller('issuer-applications')
export class IssuerApplicationsController {
  constructor(
    private readonly issuerApplicationsService: IssuerApplicationsService,
    private readonly authIssuerService: AuthIssuerService,
  ) {}

  /**
   * POST /issuer-applications
   * Create a new issuer application (requires authentication)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateIssuerApplicationDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.userId;
    const application = await this.issuerApplicationsService.create(createDto, userId);
    return {
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: application._id,
        applicationId: application.applicationId,
        userId: application.userId,
        email: application.email,
        phoneNumber: application.phoneNumber,
        legalEntityName: application.legalEntityName,
        countryOfIncorporation: application.countryOfIncorporation,
        assetCategory: application.assetCategory,
        shortAssetDescription: application.shortAssetDescription,
        status: application.status,
        submittedAt: application.createdAt,
      },
    };
  }

  /**
   * GET /issuer-applications
   * Get all applications with pagination and filtering (PUBLIC)
   */
  @Get()
  async findAll(@Query() queryDto: QueryIssuerApplicationDto) {
    const result = await this.issuerApplicationsService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /issuer-applications/my-applications
   * Get current user's applications (requires authentication)
   */
  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(
    @Query() queryDto: QueryIssuerApplicationDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.userId;
    const result = await this.issuerApplicationsService.findByUserId(userId, queryDto);
    const user = await this.authIssuerService.getProfile(userId);
    return {
      success: true,
      data: {
        ...result,
        user,
      },
    };
  }

  /**
   * GET /issuer-applications/:id
   * Get single application by MongoDB ID (PUBLIC)
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const application = await this.issuerApplicationsService.findById(id);
    return {
      success: true,
      data: application,
    };
  }
}
