import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetDoc, AssetDocumentDoc } from '../schema/assetDocument.model';
import { Asset, AssetDocument as AssetModelDoc } from '../schema/asset.model';
import { CreateAssetDocumentDto } from './dto/create-asset-document.dto';
import { UpdateAssetDocumentDto } from './dto/update-asset-document.dto';

@Injectable()
export class AssetDocumentService {
  constructor(
    @InjectModel(AssetDoc.name)
    private readonly assetDocumentModel: Model<AssetDocumentDoc>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetModelDoc>,
  ) {}

  /**
   * Creates a new document for a specific asset.
   * Ensures the asset exists, belongs to the issuer, and no duplicate document name exists.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @param {CreateAssetDocumentDto} createDto - The document data to create.
   * @returns {Promise<AssetDocumentDoc>} The created asset document.
   * @throws {NotFoundException} If asset is not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate document name exists.
   */
  async createAssetDocument(
    assetId: string,
    issuerId: string,
    createDto: CreateAssetDocumentDto,
  ): Promise<AssetDocumentDoc> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    // Check if document with same name already exists for this asset
    const existingDocument = await this.assetDocumentModel.findOne({
      assetId,
      issuerId,
      name: createDto.name,
    });

    if (existingDocument) {
      throw new ConflictException(
        `A document with the name "${createDto.name}" already exists for this asset`,
      );
    }

    // Create new asset document
    const assetDocument = new this.assetDocumentModel({
      assetId,
      issuerId,
      ...createDto,
    });

    return await assetDocument.save();
  }

  /**
   * Retrieves a document by its document ID.
   * Ensures the document belongs to the issuer.
   * @param {string} documentId - The ID of the document.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDocumentDoc>} The retrieved document.
   * @throws {NotFoundException} If document is not found or doesn't belong to issuer.
   */
  async getDocumentByDocumentId(
    documentId: string,
    issuerId: string,
  ): Promise<AssetDocumentDoc> {
    const document = await this.assetDocumentModel.findOne({
      _id: documentId,
      issuerId,
    });

    if (!document) {
      throw new NotFoundException(
        'Asset document not found or does not belong to this issuer',
      );
    }

    return document;
  }

  /**
   * Updates a document by its ID.
   * Ensures the document belongs to the issuer and no duplicate document name exists.
   * @param {string} documentId - The ID of the document.
   * @param {string} issuerId - The ID of the issuer.
   * @param {UpdateAssetDocumentDto} updateDto - The data to update.
   * @returns {Promise<AssetDocumentDoc>} The updated document.
   * @throws {NotFoundException} If document not found or doesn't belong to issuer.
   * @throws {ConflictException} If duplicate name exists.
   */
  async updateAssetDocument(
    documentId: string,
    issuerId: string,
    updateDto: UpdateAssetDocumentDto,
  ): Promise<AssetDocumentDoc> {
    // First get the current document to check whether it exists
    const currentDocument = await this.assetDocumentModel.findOne({
      _id: documentId,
      issuerId,
    });

    if (!currentDocument) {
      throw new NotFoundException(
        'Asset document not found or does not belong to this issuer',
      );
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existingDocument = await this.assetDocumentModel.findOne({
        assetId: currentDocument.assetId,
        issuerId,
        name: updateDto.name,
        _id: { $ne: documentId },
      });

      if (existingDocument) {
        throw new ConflictException(
          `A document with the name "${updateDto.name}" already exists for this asset`,
        );
      }
    }

    const document = await this.assetDocumentModel.findOneAndUpdate(
      { _id: documentId, issuerId },
      { ...updateDto },
      { new: true, runValidators: true },
    );

    if (!document) {
      throw new NotFoundException(
        'Asset document not found or does not belong to this issuer',
      );
    }

    return document;
  }

  /**
   * Retrieves all documents for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<AssetDocumentDoc[]>} List of asset documents.
   * @throws {NotFoundException} If asset is not found or doesn't belong to issuer.
   */
  async getAllDocumentsByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetDocumentDoc[]> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    return await this.assetDocumentModel.find({ assetId, issuerId });
  }

  /**
   * Deletes all documents for a specific asset.
   * Ensures the asset belongs to the issuer.
   * @param {string} assetId - The ID of the asset.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<{ deletedCount: number }>} The count of documents deleted.
   * @throws {NotFoundException} If asset is not found or doesn't belong to issuer.
   */
  async deleteAllAssetDocuments(
    assetId: string,
    issuerId: string,
  ): Promise<{ deletedCount: number }> {
    // Check if asset exists and belongs to the issuer
    const asset = await this.assetModel.findOne({ _id: assetId, issuerId });
    if (!asset) {
      throw new NotFoundException(
        'Asset not found or does not belong to this issuer',
      );
    }

    const result = await this.assetDocumentModel.deleteMany({
      assetId,
      issuerId,
    });
    return { deletedCount: result.deletedCount || 0 };
  }

  /**
   * Deletes a specific document by its ID.
   * Ensures the document belongs to the issuer.
   * @param {string} documentId - The ID of the document.
   * @param {string} issuerId - The ID of the issuer.
   * @returns {Promise<{ deleted: boolean }>} Whether the document was deleted.
   * @throws {NotFoundException} If document is not found or doesn't belong to issuer.
   */
  async deleteAssetDocument(
    documentId: string,
    issuerId: string,
  ): Promise<{ deleted: boolean }> {
    const result = await this.assetDocumentModel.deleteOne({
      _id: documentId,
      issuerId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Asset document not found or does not belong to this issuer',
      );
    }

    return { deleted: true };
  }
}

