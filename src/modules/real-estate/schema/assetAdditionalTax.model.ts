import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AdditionalTaxDocument = HydratedDocument<AdditionalTax>;

@Schema({
  collection: 'assetAdditionalTaxes',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AdditionalTax extends Document {
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
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: Number,
    required: true,
  })
  value: number;
}

export const AdditionalTaxSchema = SchemaFactory.createForClass(AdditionalTax);
