import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  SignupDto,
  VerifyOtpDto,
  RefreshTokenDto,
  UpdateAccountDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse } from './interfaces/auth-response.interface';

@Controller('tokera-auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Signup - Create account with profile details
   * POST /auth/signup
   * 
   * This creates a new user account and sends an OTP for email verification.
   * Requires: email, firstName, lastName
   */
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);
    return {
      statusCode: HttpStatus.OK,
      message: `Account created! OTP sent to ${signupDto.email}. Please verify your email to continue.`,
      data: result,
    };
  }

  /**
   * Login - Request OTP for existing user
   * POST /auth/login
   * 
   * This sends an OTP to an existing user's email for authentication.
   * Requires: email only (user must already have an account)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() sendOtpDto: SendOtpDto) {
    const result = await this.authService.login(sendOtpDto);
    return {
      statusCode: HttpStatus.OK,
      message: `OTP sent to ${sendOtpDto.email}. Please check your email to complete login.`,
      data: result,
    };
  }

  /**
   * Send OTP to email (Generic endpoint - works for both signup and login)
   * POST /auth/send-otp
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    const result = await this.authService.generateAndSendOTP(sendOtpDto);
    return {
      statusCode: HttpStatus.OK,
      message: `OTP sent to your email: ${sendOtpDto.email}`,
      data: result,
    };
  }

  /**
   * Verify OTP
   * POST /auth/verify-otp
   * 
   * Requires: Authorization header with Bearer token (from signup/login)
   * Body: { otp: "123456" }
   */
  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyOTP(
    @CurrentUser() user: any,
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data: AuthResponse;
  }> {
    const result = await this.authService.verifyEmailOTP(user.userId, verifyOtpDto.otp);
    return {
      statusCode: HttpStatus.OK,
      message: 'OTP verified successfully',
      data: result,
    };
  }

  /**
   * Refresh access token
   * POST /toker-auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshAccessToken(
      refreshTokenDto.sessionId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Access token refreshed successfully',
      data: result,
    };
  }

  /**
   * Update account details (Protected route)
   * PUT /auth/account/:id
   */
  @Put('account/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const result = await this.authService.updateAccount(id, updateAccountDto);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.user,
    };
  }

  /**
   * Get current user profile (Protected route)
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: any) {
    const userId = req.user?.userId;
    const user = await this.authService.getUserById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User profile retrieved successfully',
      data: user,
    };
  }
}

