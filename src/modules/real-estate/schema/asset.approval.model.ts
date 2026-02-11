
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { AssetStatus } from '../interfaces/asset.type';

export type AssetApprovalDocument = HydratedDocument<assetApproval>;

@Schema({
  collection: 'assetapprovals',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class assetApproval extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'issuerprofiles',
    required: true,
  })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'assets',
    required: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  issuername: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  assetName: string;

  @Prop({
    enum: Object.values(AssetStatus),
    required: true,
  })
  status: AssetStatus;

   @Prop({
    type: String,
    trim: true,
    })
    issuerComments?: string;
  
  @Prop({
    type: String,
    trim: true,
  })  
  adminComments?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AssetApprovalSchema = SchemaFactory.createForClass(assetApproval);
