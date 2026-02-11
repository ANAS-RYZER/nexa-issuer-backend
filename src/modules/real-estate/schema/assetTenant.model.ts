import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  TenantStatus,
  TenantType,
} from '../interfaces/assetTenant.types';

export type AssetTenantDocument = HydratedDocument<AssetTenant>;

@Schema({
  collection: 'assettenants',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetTenant extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'issuerprofiles',
      required: true,
    })
    issuerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  rentPerSft: number;

  @Prop({ required: true })
  sftsAllocated: number;

  @Prop({ required: true })
  annualRentEscalation: number;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: Object.values(TenantStatus),
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Prop({
    type: String,
    enum: Object.values(TenantType),
    default: TenantType.CORPORATE,
    required: true,
  })
  type: TenantType;

  @Prop({ required: true })
  lockInPeriod: number;

  @Prop({ required: true })
  leasePeriod: number;

  @Prop({ required: true })
  securityDeposit: number;

  @Prop({ required: true })
  interestOnSecurityDeposit: number;

  @Prop({
    type: {
      name: { type: String, trim: true, default: null },
      url: { type: String, trim: true, default: null },
    },
    default: null,
  })
  agreement?: { name: string | null; url: string | null } | null;

  @Prop({ type: String, trim: true, default: null })
  logo?: string | null;
}

export const AssetTenantSchema = SchemaFactory.createForClass(AssetTenant);
