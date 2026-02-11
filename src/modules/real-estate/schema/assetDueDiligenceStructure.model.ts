import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AssetDueDiligenceStructureDocument =
  HydratedDocument<AssetDueDiligenceStructure>;

@Schema({
  collection: 'assetduediligencestructures',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetDueDiligenceStructure extends Document {
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

export const AssetDueDiligenceStructureSchema = SchemaFactory.createForClass(
  AssetDueDiligenceStructure,
);
