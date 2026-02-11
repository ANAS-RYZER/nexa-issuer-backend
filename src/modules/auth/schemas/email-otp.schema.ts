import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type EmailOTPDocument = EmailOTP & Document & {
  compareOTP(otp: string): Promise<boolean>;
};

@Schema({ 
  collection: 'emailotps',
  timestamps: true 
})
export class EmailOTP {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  otpCode: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: 1 })
  attempts: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EmailOTPSchema = SchemaFactory.createForClass(EmailOTP);

// Hash OTP before saving
EmailOTPSchema.pre('save', async function (next) {
  if (!this.isModified('otpCode')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.otpCode = await bcrypt.hash(this.otpCode, salt);
  next();
});

// Method to compare OTP
EmailOTPSchema.methods.compareOTP = async function (otp: string): Promise<boolean> {
  return bcrypt.compare(otp, this.otpCode);
};

// Auto-delete expired OTPs
EmailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

