import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  INITIATED = 'initiated',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  TOKEN_TRANSFER_PENDING = 'token_transfer_pending',
  TOKEN_TRANSFERRED = 'token_transferred',
  TOKEN_TRANSFER_FAILED = 'token_transfer_failed',
  SIGNATURE_PENDING = 'signature_pending',
  COMPLETED = 'completed',
}

@Schema({
  collection: 'orders',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Order extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Asset' })
  assetId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  investorId: Types.ObjectId;

  @Prop({ required: true })
  numberOfTokens: number;

  @Prop({ required: false })
  investorAmount?: number;

  @Prop({ required: false })
  investorPaidAmount?: number;

  @Prop({ required: false, trim: true })
  investorCurrency?: string;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.INITIATED })
  status: OrderStatus;

  @Prop({required:true})
  tokenValue?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for faster querying
OrderSchema.index({ assetId: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ assetId: 1, status: 1 });
