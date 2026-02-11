import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  EAssetDocumentType,
} from '../interfaces/assetDocument.types';

export type AssetDocumentDoc = HydratedDocument<AssetDoc>;

@Schema({
  collection: 'assetdocuments',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetDoc extends Document {
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

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(EAssetDocumentType),
    required: true,
  })
  type: string;

  @Prop({ type: String, default: null })
  format?: string | null;

  @Prop({
    type: {
      name: { type: String, default: null },
      url: { type: String, default: null },
    },
    default: null,
  })
  document?: { name: string | null; url: string | null } | null;

  @Prop({ type: Boolean, default: false })
  isProtected: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const AssetDocumentSchema = SchemaFactory.createForClass(AssetDoc);
