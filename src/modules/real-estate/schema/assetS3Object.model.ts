import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { IS3ObjectType } from '../interfaces/assetS3Object';
import { MimeTypes } from '../interfaces/mimeTypes';

export type AssetS3ObjectDocument = HydratedDocument<AssetS3Object>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetS3Object extends Document {
  @Prop({ required: true })
  refId: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(IS3ObjectType),
  })
  belongsTo: IS3ObjectType;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MimeTypes),
  })
  mimeType: MimeTypes;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  bucket: string;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const AssetS3ObjectSchema = SchemaFactory.createForClass(AssetS3Object);

AssetS3ObjectSchema.index({ refId: 1, mimeType: 1 });
