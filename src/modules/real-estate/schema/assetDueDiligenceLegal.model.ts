import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AssetDueDiligenceLegalDocument =
  HydratedDocument<AssetDueDiligenceLegal>;

@Schema({
  collection: 'assetduediligencelegals',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetDueDiligenceLegal extends Document {
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
  logoUrl: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  link: string;
}

export const AssetDueDiligenceLegalSchema = SchemaFactory.createForClass(
  AssetDueDiligenceLegal,
);
