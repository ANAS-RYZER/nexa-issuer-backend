import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, model, CallbackError } from 'mongoose';
import httpStatus from 'http-status';
import { VestingType } from "../interfaces/assetAllocationCategory.types";
import ApiError from "../common/ApiError";

export type AssetAllocationCategoryDocument = HydratedDocument<AssetAllocationCategory>;

export interface IAllocationTotals {
  percentage: number;
  tokens: number;
}

export interface IAllocationValidationResult {
  totalPercentage: number;
  totalTokens: number;
  remainingPercentage: number;
  remainingTokens: number;
  isValid: boolean;
}

export interface IAllocationStats {
  isValid: boolean;
  totalPercentage: number;
  totalTokens: number;
  remainingPercentage: number;
  remainingTokens: number;
}

@Schema({
  collection: 'assetAllocationCategories',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
})
export class AssetAllocationCategory extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Asset',
    required: true,
    index: true,
  })
  assetId: MongooseSchema.Types.ObjectId;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'issuerprofiles',
      required: true,
    })
    issuerId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  category: string;

  @Prop({
    type: Number,
    min: 0,
    max: 100,
  })
  percentage: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  tokens: number;

  @Prop({
    type: String,
    enum: Object.values(VestingType),
    required: true,
  })
  vestingType: VestingType;

  @Prop({
    type: Date,
    validate: {
      validator: function(this: AssetAllocationCategoryDocument, startDate: Date) {
        // Only validate if vestingType requires dates
        if (this.vestingType === VestingType.NO_VESTING) return true;
        return startDate != null;
      },
      message: 'Vesting start date is required for linear and cliff vesting'
    }
  })
  vestingStartDate?: Date;

  @Prop({
    type: Date,
    validate: {
      validator: function(this: AssetAllocationCategoryDocument, endDate: Date) {
        // Only validate if vestingType requires dates
        if (this.vestingType === VestingType.NO_VESTING) return true;
        if (!endDate) return false;
        if (!this.vestingStartDate) return false;
        return endDate > this.vestingStartDate;
      },
      message: 'Vesting end date must be after start date'
    }
  })
  vestingEndDate?: Date;

  @Prop({
    type: Number,
    min: 0,
    validate: {
      validator: function(this: AssetAllocationCategoryDocument, period: number) {
        if (this.vestingType !== VestingType.CLIFF_VESTING) return true;
        if (!period) return false;
        if (!this.vestingStartDate || !this.vestingEndDate) return false;
        const totalDuration = Math.ceil((this.vestingEndDate.getTime() - this.vestingStartDate.getTime()) / (1000 * 60 * 60 * 24));
        return period < totalDuration;
      },
      message: 'Cliff period must be less than total vesting duration'
    }
  })
  cliffPeriod?: number;

  @Prop({
    type: String,
    trim: true,
  })
  description?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  // Virtual field - calculated on the fly
  vestingDuration?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AssetAllocationCategorySchema = SchemaFactory.createForClass(AssetAllocationCategory);

// Indexes for better query performance
AssetAllocationCategorySchema.index({ assetId: 1, category: 1 }, { unique: true });

// Add virtual field for vestingDuration
AssetAllocationCategorySchema.virtual('vestingDuration').get(function(this: AssetAllocationCategoryDocument) {
  if (this.vestingStartDate && this.vestingEndDate) {
    return Math.ceil((this.vestingEndDate.getTime() - this.vestingStartDate.getTime()) / (1000 * 60 * 60 * 24)); // Duration in days
  }
  return null;
});

// Pre-save middleware - simplified validation only (percentage calculation handled in service)
AssetAllocationCategorySchema.pre('save', async function(this: AssetAllocationCategoryDocument, next) {
  try {
    // Validate vesting dates if both are provided
    if (this.vestingStartDate && this.vestingEndDate && this.vestingEndDate <= this.vestingStartDate) {
      const error = new Error('Vesting end date must be after vesting start date') as any;
      error.statusCode = 400;
      throw error;
    }

    next();
  } catch (error: any) {
    next(error as CallbackError);
  }
});

// Note: Static methods removed - all logic now handled in AllocationCategoryService
