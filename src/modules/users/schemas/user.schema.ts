import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      delete ret.password; // Hide password if you add it later
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  })
  email: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ default: false })
  isPhoneVerified?: boolean;

  @Prop({ default: false })
  isKycVerified?: boolean;

  @Prop({
    type: String,
    enum: ['initiated', 'pending', 'approved', 'rejected'],
    
  })
  kycStatus?: 'initiated' | 'pending' | 'approved' | 'rejected';

  @Prop({
    type: Number,
    default: 0
  })
  kycRetryCount?: number;

  @Prop()
  kycReviewedAt?: Date;

  @Prop()
  kycRejectReason?: string;


  @Prop({default: "https://ryzer-v2.s3.ap-south-1.amazonaws.com/users/681c506bd81904bc923c7757/094fd3a1-3729-4f71-ad9f-86a74b1066be.png"})
  avatar?: string;

  @Prop({ trim: true })
  mobileNumber?: string;

  // Timestamps (automatically managed by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for optimized queries
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ isKycVerified: 1 });
UserSchema.index({ createdAt: -1 });

