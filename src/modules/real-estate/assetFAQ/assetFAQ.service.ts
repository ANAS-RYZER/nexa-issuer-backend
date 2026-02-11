import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../schema/assetFAQ.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class AssetFaqService {
  constructor(
    @InjectModel(Faq.name)
    private readonly faqModel: Model<FaqDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Creates a new FAQ for the given asset.
   * Validates asset existence, issuer ownership, and duplicate question before saving.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateFaqDto} createDto - The FAQ data including question and answer.
   * @returns {Promise<FaqDocument>} The created FAQ document.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate question exists.
   */
  async createFaq(
    assetId: string,
    issuerId: string,
    createDto: CreateFaqDto,
  ): Promise<FaqDocument> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if FAQ with same question already exists for this asset
    const existingFaq = await this.faqModel.findOne({
      assetId,
      issuerId,
      question: createDto.question,
    });

    if (existingFaq) {
      throw new ConflictException(
        `A FAQ with the question "${createDto.question}" already exists for this asset`,
      );
    }

    const newFaq = new this.faqModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await newFaq.save();
  }

  /**
   * Retrieves all FAQs for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<FaqDocument[]>} List of FAQ documents.
   * @throws {NotFoundException} If asset not found or doesn't belong to issuer.
   */
  async getAllFaqByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<FaqDocument[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.faqModel.find({ assetId, issuerId });
  }

  /**
   * Updates a FAQ by its ID.
   * Validates existence, issuer ownership, and duplicate question before updating.
   * @param {string} faqId - The ID of the FAQ.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateFaqDto} updateDto - The data to update (question, answer, etc).
   * @returns {Promise<FaqDocument>} The updated FAQ document.
   * @throws {NotFoundException} If FAQ not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate question exists.
   */
  async updateFaq(
    faqId: string,
    issuerId: string,
    updateDto: UpdateFaqDto,
  ): Promise<FaqDocument> {
    // First get the current FAQ to check whether it exists
    const currentFaq = await this.faqModel.findOne({
      _id: faqId,
      issuerId,
    });

    if (!currentFaq) {
      throw new NotFoundException(
        'FAQ not found or does not belong to this issuer',
      );
    }

    // If question is being updated, check for duplicates
    if (updateDto.question) {
      const existingFaq = await this.faqModel.findOne({
        assetId: currentFaq.assetId,
        issuerId,
        question: updateDto.question,
        _id: { $ne: faqId },
      });

      if (existingFaq) {
        throw new ConflictException(
          `A FAQ with the question "${updateDto.question}" already exists for this asset`,
        );
      }
    }

    const updatedFaq = await this.faqModel.findOneAndUpdate(
      { _id: faqId, issuerId },
      updateDto,
      { new: true, runValidators: true },
    );

    if (!updatedFaq) {
      throw new NotFoundException(
        'FAQ not found or does not belong to this issuer',
      );
    }

    return updatedFaq;
  }

  /**
   * Deletes a FAQ by its ID.
   * Ensures the FAQ belongs to the issuer.
   * @param {string} faqId - The ID of the FAQ.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<FaqDocument>} The deleted FAQ document.
   * @throws {NotFoundException} If FAQ not found or doesn't belong to issuer.
   */
  async deleteFaq(faqId: string, issuerId: string): Promise<FaqDocument> {
    const deletedFaq = await this.faqModel.findOneAndDelete({
      _id: faqId,
      issuerId,
    });

    if (!deletedFaq) {
      throw new NotFoundException(
        'FAQ not found or does not belong to this issuer',
      );
    }

    return deletedFaq;
  }
}

