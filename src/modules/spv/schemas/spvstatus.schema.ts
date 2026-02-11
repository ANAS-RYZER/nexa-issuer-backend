import { CompanyStatus } from "./spv.schema";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SpvStatusDocument = HydratedDocument<spvStatus>;

@Schema({
  collection: 'spvstatus',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class spvStatus extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'issuerprofiles',
    required: true,
  })
  issuerId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'spvs',
    required: true,
  })
  spvId: MongooseSchema.Types.ObjectId;

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
  issueremail: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  spvname: string;

  @Prop({
    enun: Object.values(CompanyStatus),
    required: true,
  })
  status: CompanyStatus;

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

export const SpvStatusSchema = SchemaFactory.createForClass(spvStatus);
