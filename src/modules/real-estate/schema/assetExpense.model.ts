import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AssetExpenseDocument = HydratedDocument<AssetExpense>;

@Schema({
  collection: 'assetExpenses',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class AssetExpense extends Document {
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

  @Prop({ type: Boolean, default: true })
  isPercentage: boolean;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ type: Boolean, default: true })
  status: boolean;
}

export const AssetExpenseSchema = SchemaFactory.createForClass(AssetExpense);
