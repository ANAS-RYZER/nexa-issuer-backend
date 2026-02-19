import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExchangeRateDocument = ExchangeRate & Document;

@Schema({ timestamps: true })
export class ExchangeRate {
  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ type: Map, of: Number })
  rates: Map<string, number>;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);
