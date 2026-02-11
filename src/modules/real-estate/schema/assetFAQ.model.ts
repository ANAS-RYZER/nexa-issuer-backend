import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({
  collection: 'faqs',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Faq extends Document {
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
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
