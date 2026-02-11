import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { FeeType } from '../interfaces/assetFeeConfig.types';

export type AssetFeeConfigDocument = HydratedDocument<AssetFeeConfig>;

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
export class AssetFeeConfig extends Document {
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

  @Prop({
    type: String,
    enum: Object.values(FeeType),
    required: true,
  })
  type: FeeType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ required: true, default: false })
  isPercentage: boolean;

  @Prop({ required: true, default: true })
  status: boolean;
}

export const AssetFeeConfigSchema = SchemaFactory.createForClass(AssetFeeConfig);
