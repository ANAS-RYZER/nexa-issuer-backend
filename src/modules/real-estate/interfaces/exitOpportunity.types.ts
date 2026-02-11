import { Schema } from "mongoose";

export interface IExitOpportunity {
  adminId: Schema.Types.ObjectId; // Optional adminId field
  assetId: Schema.Types.ObjectId;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
} 