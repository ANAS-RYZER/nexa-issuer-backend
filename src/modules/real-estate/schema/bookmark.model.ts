import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type BookmarkDocument = HydratedDocument<Bookmark>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Bookmark extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  investorId: MongooseSchema.Types.ObjectId;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

BookmarkSchema.index({ investorId: 1, assetId: 1 }, { unique: true });
