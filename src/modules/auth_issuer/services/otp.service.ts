import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore: Map<string, { otp: string; expiry: number }> = new Map();

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP with expiration (default: 10 minutes)
   */
  async storeOtp(
    email: string,
    otp: string,
    expiresIn: number = 600,
  ): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const expiry = Date.now() + expiresIn * 1000;

    this.otpStore.set(normalizedEmail, { otp, expiry });
    this.logger.log(`OTP stored for ${normalizedEmail}`);

    // Auto cleanup after expiry
    setTimeout(() => {
      this.otpStore.delete(normalizedEmail);
    }, expiresIn * 1000);
  }

  /**
   * Verify OTP for a given email
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const stored = this.otpStore.get(normalizedEmail);

    if (!stored) {
      this.logger.warn(`OTP not found for email: ${normalizedEmail}`);
      return false;
    }

    if (Date.now() > stored.expiry) {
      this.otpStore.delete(normalizedEmail);
      this.logger.warn(`OTP expired for email: ${normalizedEmail}`);
      return false;
    }

    if (stored.otp !== otp.trim()) {
      this.logger.warn(`OTP mismatch for email: ${normalizedEmail}`);
      return false;
    }

    // OTP verified successfully, delete it (one-time use)
    this.otpStore.delete(normalizedEmail);
    return true;
  }

  /**
   * Check if OTP exists for a given email
   */
  async otpExists(email: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const stored = this.otpStore.get(normalizedEmail);

    if (!stored) return false;
    if (Date.now() > stored.expiry) {
      this.otpStore.delete(normalizedEmail);
      return false;
    }
    return true;
  }
}

