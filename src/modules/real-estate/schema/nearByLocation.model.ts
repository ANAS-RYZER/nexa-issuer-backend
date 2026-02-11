import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export enum LocationType {
  AIRPORT = 'airport',
  METRO = 'metro',
  HOSPITAL = 'hospital',
  MALL = 'mall',
  SCHOOL = 'school',
  PARK = 'park',
  RESTAURANT = 'restaurant',
  BANK = 'bank',
  ATM = 'atm',
  PHARMACY = 'pharmacy',
  GROCERY = 'grocery',
  GYM = 'gym',
  CINEMA = 'cinema',
  OTHER = 'other',
}

export type NearByLocationDocument = HydratedDocument<NearByLocation>;

@Schema({
  collection: 'nearbylocations',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class NearByLocation extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(LocationType),
    required: true,
  })
  locationType: LocationType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, min: 0 })
  distanceInKm: number;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;
}

export const NearByLocationSchema = SchemaFactory.createForClass(NearByLocation);
