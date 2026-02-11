import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AssetAmenityDocument = HydratedDocument<AssetAmenity>;

@Schema({
  collection: 'amenities',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetAmenity extends Document {
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

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  createdAt?: Date;
}

export const AssetAmenitySchema = SchemaFactory.createForClass(AssetAmenity);
