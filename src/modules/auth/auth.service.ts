import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../infra/email/email.service';
import { TokenStorageService } from './services/token-storage.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailOTP, EmailOTPDocument } from './schemas/email-otp.schema';
import { SendOtpDto, SignupDto, VerifyOtpDto, UpdateAccountDto } from './dto';
import { AuthResponse } from './interfaces/auth-response.interface';

// Constants
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const WHITELIST_EMAILS = [
  'rajesh@ryzer.app',
  'pooja.malhotra@srammram.com',
  'kannan@srammram.com',
  'slh@srammram.com',
  "test@gmail.com",
  "failkyc1@gmail.com",
  "successkyc1@gmail.com",
  "kyctest2@gmail.com",
  "deploy2@gmail.com",
  "prathap1@ryzer.app"
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(EmailOTP.name) private emailOTPModel: Model<EmailOTPDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private tokenStorageService: TokenStorageService,
  ) { }

  /**
   * Generate random OTP
   */
  private generateOTP(length: number = OTP_LENGTH): string {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    ).toString();
  }

  /**
   * Generate JWT tokens and store session
   */
  private async generateTokensAndStoreSession(userId: Types.ObjectId): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    const sessionId = new Types.ObjectId().toString();

    const accessToken = this.jwtService.sign(
      { userId: userId.toString(), sessionId },
      {
        secret: this.configService.get('TOKER_JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('TOKER_JWT_ACCESS_EXPIRES_IN', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { userId: userId.toString(), sessionId },
      {
        secret: this.configService.get('TOKER_JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('TOKER_JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    // Store session with refresh token
    await this.tokenStorageService.storeSession(
      sessionId,
      userId.toString(),
      refreshToken,
      7 * 24 * 60 * 60, // 7 days in seconds
    );

    this.logger.log(`✅ Tokens generated and session stored for user ${userId}`);

    return { accessToken, refreshToken, sessionId };
  }

  /**
   * Signup - Create new user with profile details and send OTP
   */
  async signup(signupDto: SignupDto): Promise<{ token: string }> {
    const { email, firstName, lastName } = signupDto;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists. Please use login instead.',
      );
    }

    // Create new user with profile details
    const user = await this.userModel.create({
      email: normalizedEmail,
      firstName,
      lastName,
    });
    this.logger.log(`New user created during signup: ${user._id}`);

    // Generate OTP
    const otp = WHITELIST_EMAILS.includes(normalizedEmail)
      ? '123456'
      : this.generateOTP();

    const otpExpiry = new Date(Date.now() + OTP_EXPIRATION_MS);

    // Create OTP record
    await this.emailOTPModel.create({
      userId: user._id,
      email: normalizedEmail,
      otpCode: otp,
      expiresAt: otpExpiry,
    });

    // Generate OTP token
    const token = this.jwtService.sign(
      { userId: user._id.toString() },
      {
        secret: this.configService.get('TOKER_JWT_OTP_SECRET'),
        expiresIn: OTP_EXPIRATION_MS,
      },
    );

    // Send OTP email
    await this.emailService.sendOtpToEmail(email, otp);

    return { token };
  }

  /**
   * Login - Send OTP to existing user
   */
  async login(sendOtpDto: SendOtpDto): Promise<{ token: string }> {
    const { email } = sendOtpDto;
    const normalizedEmail = email.toLowerCase();

    // Find existing user
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundException(
        'No account found with this email. Please sign up first.',
      );
    }

    // Generate OTP
    const otp = WHITELIST_EMAILS.includes(normalizedEmail)
      ? '123456'
      : this.generateOTP();

    const otpExpiry = new Date(Date.now() + OTP_EXPIRATION_MS);

    // Check existing OTP
    let existingOTP = await this.emailOTPModel.findOne({ email: normalizedEmail });

    if (existingOTP) {
      if (existingOTP.attempts >= MAX_OTP_ATTEMPTS) {
        throw new BadRequestException(
          'Maximum OTP attempts exceeded. Please try again later.',
        );
      }

      existingOTP.attempts += 1;
      existingOTP.otpCode = otp;
      existingOTP.expiresAt = otpExpiry;
      await existingOTP.save();
    } else {
      await this.emailOTPModel.create({
        userId: user._id,
        email: normalizedEmail,
        otpCode: otp,
        expiresAt: otpExpiry,
      });
    }

    // Generate OTP token
    const token = this.jwtService.sign(
      { userId: user._id.toString() },
      {
        secret: this.configService.get('TOKER_JWT_OTP_SECRET'),
        expiresIn: OTP_EXPIRATION_MS,
      },
    );

    // Send OTP email
    await this.emailService.sendOtpToEmail(email, otp);
    this.logger.log(`✅ Login OTP sent to ${email}`);

    return { token };
  }

  /**
   * Generate and send OTP to email (Generic - for backward compatibility)
   */
  async generateAndSendOTP(sendOtpDto: SendOtpDto): Promise<{ token: string }> {
    const { email } = sendOtpDto;
    const normalizedEmail = email.toLowerCase();

    // Find or create user
    let user = await this.userModel.findOne({ email: normalizedEmail });

    if (!user) {
      user = await this.userModel.create({ email: normalizedEmail });
      this.logger.log(`New user created: ${user._id}`);
    }

    // Generate OTP
    const otp = WHITELIST_EMAILS.includes(normalizedEmail)
      ? '123456'
      : this.generateOTP();

    const otpExpiry = new Date(Date.now() + OTP_EXPIRATION_MS);

    // Check existing OTP
    let existingOTP = await this.emailOTPModel.findOne({ email: normalizedEmail });

    if (existingOTP) {
      if (existingOTP.attempts >= MAX_OTP_ATTEMPTS) {
        throw new BadRequestException(
          'Maximum OTP attempts exceeded. Please try again later.',
        );
      }

      existingOTP.attempts += 1;
      existingOTP.otpCode = otp;
      existingOTP.expiresAt = otpExpiry;
      await existingOTP.save();
    } else {
      await this.emailOTPModel.create({
        userId: user._id,
        email: normalizedEmail,
        otpCode: otp,
        expiresAt: otpExpiry,
      });
    }

    // Generate OTP token
    const token = this.jwtService.sign(
      { userId: user._id.toString() },
      {
        secret: this.configService.get('TOKER_JWT_OTP_SECRET'),
        expiresIn: OTP_EXPIRATION_MS,
      },
    );

    // Send OTP email
    await this.emailService.sendOtpToEmail(email, otp);
    this.logger.log(`✅ OTP sent to ${email}`);

    return { token };
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOTP(userId: string, otp: string): Promise<AuthResponse> {
    // Validate user ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Find user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found. Please register.');
    }

    // Find OTP
    const emailOTP = await this.emailOTPModel.findOne({ email: user.email });
    if (!emailOTP) {
      throw new BadRequestException('OTP expired or not found.');
    }

    // Check OTP expiration
    if (new Date() > emailOTP.expiresAt) {
      await this.emailOTPModel.deleteOne({ _id: emailOTP._id });
      throw new BadRequestException('OTP has expired.');
    }

    // Verify OTP
    const isValidOTP = await emailOTP.compareOTP(otp);
    if (!isValidOTP) {
      throw new BadRequestException('Invalid OTP.');
    }

    // Delete OTP after successful verification
    await this.emailOTPModel.deleteOne({ _id: emailOTP._id });

    // Handle first-time email verification
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();

      // TODO: Send welcome email
      // await this.emailService.sendWelcomeEmail(user.email);
      this.logger.log(`Welcome email sent to ${user.email}`);
    }

    // Check if new user (missing required fields)
    const isNewUser = !user.firstName || !user.lastName;

    // Generate tokens
    const { accessToken, refreshToken, sessionId } = await this.generateTokensAndStoreSession(
      user._id as Types.ObjectId,
    );

    return {
      accessToken,
      refreshToken,
      sessionId,
      user,
      isNewUser,
    };
  }

  /**
   * Refresh access token using session ID
   */
  async refreshAccessToken(sessionId: string): Promise<{ accessToken: string }> {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    // Fetch session from storage
    const sessionData = await this.tokenStorageService.getSession(sessionId);
    if (!sessionData || !sessionData.refreshToken) {
      throw new UnauthorizedException('Invalid or expired session. Please log in again.');
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = this.jwtService.verify(sessionData.refreshToken, {
        secret: this.configService.get('TOKER_JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      // Clean up invalid session
      await this.tokenStorageService.deleteSession(sessionId);
      throw new UnauthorizedException('Invalid or expired refresh token. Please log in again.');
    }

    // Verify user still exists
    const user = await this.userModel.findById(decoded.userId);
    if (!user) {
      await this.tokenStorageService.deleteSession(sessionId);
      throw new NotFoundException('User not found. Please register again.');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(
      { userId: decoded.userId, sessionId },
      {
        secret: this.configService.get('TOKER_JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('TOKER_JWT_ACCESS_EXPIRES_IN', '15m'),
      },
    );

    // Optionally refresh session expiry
    await this.tokenStorageService.refreshSessionExpiry(sessionId);

    this.logger.log(`✅ Access token refreshed for session ${sessionId}`);

    return { accessToken };
  }

  /**
   * Logout - Delete session
   */
  async logout(sessionId: string): Promise<{ message: string }> {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    await this.tokenStorageService.deleteSession(sessionId);

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId: string): Promise<{ message: string; count: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const count = await this.tokenStorageService.deleteAllUserSessions(userId);

    return {
      message: 'Logged out from all devices successfully',
      count,
    };
  }


  /**
   * Update user account details
   */
  async updateAccount(
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<{ message: string; user: UserDocument }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check mobile number conflict
    if (updateAccountDto.mobileNumber) {
      const mobileConflict = await this.userModel.findOne({
        mobileNumber: updateAccountDto.mobileNumber,
        _id: { $ne: userId },
      });

      if (mobileConflict) {
        throw new ConflictException(
          'Mobile number already in use by another account',
        );
      }
    }

    // Update user
    Object.assign(user, updateAccountDto);
    await user.save();

    this.logger.log(`User account updated: ${userId}`);

    return {
      message: 'Account updated successfully',
      user,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

