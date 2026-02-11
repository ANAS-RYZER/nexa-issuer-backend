import { Document, Types } from 'mongoose';
import { MimeTypes } from './mimeTypes';

export enum IS3ObjectType {
  ASSET = 'asset',
  USER = 'user',
  COMPANY = 'company',
  OTHER = 'other',
  ADMIN = 'admin'
}

/**
 * Base interface for S3 asset objects. Represents the structure of
 * files stored in AWS S3 along with their metadata and relationships.
 */
export interface IAssetS3Object {
  /** ID of the parent asset this S3 object belongs to */
  refId: string;

  /** The type of object this S3 object belongs to */
  belongsTo: IS3ObjectType;
  
  /** Original name of the uploaded file */
  fileName: string;
  
  /** Size of the file in bytes */
  fileSize: number;
  
  /** MIME type of the file (must be from supported MimeTypes) */
  mimeType: MimeTypes;
  
  /** S3 object key (path in the bucket) */
  key: string;
  
  /** Name of the S3 bucket where the file is stored */
  bucket: string;
  
  /** Whether the file is publicly accessible */
  isPublic: boolean;
  
  /* Commented out for now
  // ID of the user who uploaded the file
  uploadedBy: Types.ObjectId;
  */
  
  /** Additional metadata stored with the file */
  metadata?: Record<string, any>;
  
  /** Timestamp of when the record was created */
  createdAt: Date;
  
  /** Timestamp of when the record was last updated */
  updatedAt: Date;
}

/**
 * Mongoose document interface for S3 assets.
 * Extends the base interface with Mongoose Document functionality.
 */
export interface IAssetS3ObjectDoc extends IAssetS3Object, Document {
  // Add methods here if needed
}

/**
 * Parameters for querying S3 assets with filtering and pagination.
 */
export interface AssetS3ObjectQueryParams {
  /** Filter by parent asset ID */
  assetId?: string;
  
  /** Filter by file MIME type */
  mimeType?: MimeTypes;
  
  /** Filter by public access setting */
  isPublic?: boolean;
  
  /* Commented out for now
  // Filter by uploader ID
  uploadedBy?: string;
  */
  
  /** Filter by creation date range start */
  startDate?: Date;
  
  /** Filter by creation date range end */
  endDate?: Date;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Number of results to skip (for pagination) */
  skip?: number;
} 