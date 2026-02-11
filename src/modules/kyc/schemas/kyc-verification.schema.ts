import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KycVerificationDocument = KycVerification & Document;

// ----- Sumsub profile structure (same as API response) -----

const IdDocSchema = {
  idDocType: String,
  country: String,
  firstName: String,
  firstNameEn: String,
  validUntil: String,
  number: String,
  dob: String,
  termless: Boolean,
};

const ReviewResultSchema = {
  moderationComment: String,
  clientComment: String,
  reviewAnswer: String, // 'GREEN' | 'RED'
  rejectLabels: [String],
  reviewRejectType: String,
  buttonIds: [String],
};

const ReviewSchema = {
  reviewId: String,
  attemptId: String,
  attemptCnt: Number,
  elapsedSincePendingMs: Number,
  elapsedSinceQueuedMs: Number,
  reprocessing: Boolean,
  levelName: String,
  levelAutoCheckMode: String,
  createDate: String,
  reviewDate: String,
  reviewResult: ReviewResultSchema,
  reviewStatus: String,
  priority: Number,
};

const InfoSchema = {
  firstName: String,
  firstNameEn: String,
  dob: String,
  country: String,
  idDocs: [IdDocSchema],
};

/**
 * KYC Verification = Sumsub applicant profile structure.
 * Same as GET /resources/applicants/:applicantId/one response + our userId ref.
 */
@Schema({ timestamps: true })
export class KycVerification {

  /** Our app ref */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  inspectionId: string;

  @Prop({ required: true, index: true })
  applicantId: string;

  @Prop({ required: true })
  externalUserId: string;

  @Prop()
  levelName: string;

  /** GREEN | RED – quick filter without digging into review */
  @Prop()
  reviewAnswer?: string;

  @Prop({ default: Date.now })
  receivedAt: Date;

  // ----- Sumsub profile fields (same shape as Profile API) -----

  @Prop()
  id?: string;

  @Prop()
  createdAt?: string;

  @Prop()
  createdBy?: string;

  @Prop()
  key?: string;

  @Prop()
  clientId?: string;

  @Prop({ type: InfoSchema })
  info?: {
    firstName?: string;
    firstNameEn?: string;
    dob?: string;
    country?: string;
    idDocs?: Array<{
      idDocType: string;
      country: string;
      firstName?: string;
      firstNameEn?: string;
      validUntil?: string;
      number?: string;
      dob?: string;
      termless?: boolean;
    }>;
  };

  @Prop()
  email?: string;

  @Prop()
  applicantPlatform?: string;

  @Prop()
  ipCountry?: string;

  @Prop({ type: Object })
  agreement?: Record<string, unknown>;

  @Prop({ type: Object })
  requiredIdDocs?: Record<string, unknown>;

  @Prop({ type: ReviewSchema })
  review?: {
    reviewId?: string;
    attemptId?: string;
    attemptCnt?: number;
    elapsedSincePendingMs?: number;
    elapsedSinceQueuedMs?: number;
    reprocessing?: boolean;
    levelName?: string;
    levelAutoCheckMode?: string | null;
    createDate?: string;
    reviewDate?: string;
    reviewResult?: {
      moderationComment?: string;
      clientComment?: string;
      reviewAnswer?: string;
      rejectLabels?: string[];
      reviewRejectType?: string;
      buttonIds?: string[];
    };
    reviewStatus?: string;
    priority?: number;
  };

  @Prop()
  type?: string;

  @Prop({ type: [Object] })
  notes?: unknown[];
}

export const KycVerificationSchema =
  SchemaFactory.createForClass(KycVerification);

KycVerificationSchema.index({ inspectionId: 1 }, { unique: true });
