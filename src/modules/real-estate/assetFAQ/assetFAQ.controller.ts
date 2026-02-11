import { JwtAuthGuard } from "../../authIssuer/guards/jwt-auth.guard";
import {
  Controller,
  HttpCode,
  UseGuards,
  Post,
  Get,
  Put,
  Delete,
  HttpStatus,
  Body,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { AssetFaqService } from './assetFAQ.service';
import {
  CreateFaqDto,
  UpdateFaqDto,
  AssetIdQueryDto,
  FaqIdParamsDto,
} from './dto';

@Controller('faq')
@UseGuards(JwtAuthGuard)
export class AssetFaqController {
  constructor(private readonly faqService: AssetFaqService) {}

  /**
   * Create a new FAQ
   * POST /faq?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFaq(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateFaqDto,
  ) {
    const issuerId = req.user?.userId;
    const newFaq = await this.faqService.createFaq(
      query.assetId,
      issuerId,
      createDto,
    );
    return {
      data: newFaq,
      message: 'FAQs created successfully',
    };
  }

  /**
   * Get all FAQs for an asset
   * GET /faq?assetId=...
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllFaqs(@Req() req: any, @Query() query: AssetIdQueryDto) {
    const issuerId = req.user?.userId;
    const faqs = await this.faqService.getAllFaqByAssetId(
      query.assetId,
      issuerId,
    );
    return {
      data: faqs,
      message: 'FAQs retrieved successfully',
    };
  }

  /**
   * Update a FAQ
   * PUT /faq/:faqId
   */
  @Put(':faqId')
  @HttpCode(HttpStatus.OK)
  async updateFaq(
    @Req() req: any,
    @Param() params: FaqIdParamsDto,
    @Body() updateDto: UpdateFaqDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedFaq = await this.faqService.updateFaq(
      params.faqId,
      issuerId,
      updateDto,
    );
    return {
      data: updatedFaq,
      message: 'FAQs updated successfully',
    };
  }

  /**
   * Delete a FAQ
   * DELETE /faq/:faqId
   */
  @Delete(':faqId')
  @HttpCode(HttpStatus.OK)
  async deleteFaq(@Req() req: any, @Param() params: FaqIdParamsDto) {
    const issuerId = req.user?.userId;
    const deletedFaq = await this.faqService.deleteFaq(
      params.faqId,
      issuerId,
    );
    return {
      data: deletedFaq,
      message: 'FAQs deleted Successfully',
    };
  }
}

