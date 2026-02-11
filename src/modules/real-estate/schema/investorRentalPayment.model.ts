import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type InvestorRentalPaymentDocument =
  HydratedDocument<InvestorRentalPayment>;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'crypto' | 'fiat' | 'wallet';

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
export class InvestorRentalPayment extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'RentalDistribution',
    required: true,
  })
  rentalDistributionId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Investor',
    required: true,
  })
  investorId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Order',
    required: true,
  })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  distributionMonth: Date;

  @Prop({ type: Number, required: true })
  distributionYear: number;

  @Prop({ type: Number, required: true, min: 0 })
  investorTokens: number;

  @Prop({ type: Number, required: true, min: 0 })
  ownershipPercentage: number;

  @Prop({ type: Number, required: true, min: 0 })
  grossRentalIncome: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalExpenses: number;

  @Prop({ type: Number, required: true, min: 0 })
  netRentalIncome: number;

  @Prop({ type: Number, required: true, min: 0 })
  investorShare: number;

  @Prop({
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: ['crypto', 'fiat', 'wallet'],
  })
  paymentMethod?: PaymentMethod;

  @Prop()
  paymentTransactionId?: string;

  @Prop()
  paymentNotes?: string;

  @Prop({ type: Date })
  paidAt?: Date;
}

export const InvestorRentalPaymentSchema = SchemaFactory.createForClass(
  InvestorRentalPayment,
);

InvestorRentalPaymentSchema.index(
  { rentalDistributionId: 1, investorId: 1, orderId: 1 },
  { unique: true, name: 'uniq_payment_per_order' },
);
