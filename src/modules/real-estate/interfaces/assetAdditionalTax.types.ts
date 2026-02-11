import { Types } from 'mongoose';

export interface IAdditionalTax {
  issuerId: Types.ObjectId;
  assetId: Types.ObjectId;
  name: string;
  value: number;
  createdAt?: Date;
  updatedAt?: Date;
} 