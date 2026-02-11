import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthIssuerService } from './auth_issuer.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('auth-issuer')
export class AuthIssuerController {
  constructor(private readonly authIssuerService: AuthIssuerService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authIssuerService.signup(signupDto);
    
    // If result has tokens, registration and verification was successful
    if ('accessToken' in result && 'refreshToken' in result) {
      return {
        success: true,
        message: 'User registered and verified successfully',
        data: result,
      };
    }

    // If result has message only, OTP was sent
    return {
      success: true,
      message: result.message,
      data: { user: result.user, isNewUser: result.isNewUser },
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() req: Request) {
    const result = await this.authIssuerService.verifyOtp(verifyOtpDto, req);
    
    // If tokens are present (signup verification), include them in response
    if (result.accessToken && result.refreshToken && result.sessionId) {
      return {
        success: true,
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          sessionId: result.sessionId,
        },
      };
    }

    return {
      success: true,
      message: result.message,
      data: { user: result.user },
    };
  }

  @Post('request-login-otp')
  @HttpCode(HttpStatus.OK)
  async requestLoginOtp(@Body() requestLoginOtpDto: RequestLoginOtpDto) {
    const result = await this.authIssuerService.requestLoginOtp(requestLoginOtpDto.email);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // Ensure we're in the login endpoint, not verify-otp
    if (!loginDto.email) {
      throw new BadRequestException('Email is required for login');
    }
    
    const result = await this.authIssuerService.login(loginDto);
    
    // If result has message only, it means OTP was sent
    if ('message' in result && !('accessToken' in result)) {
      return {
        success: true,
        message: result.message,
      };
    }

    // If result has tokens, login was successful
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authIssuerService.refreshAccessToken(refreshTokenDto);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const sessionId = (req as any).user?.sessionId;
    if (!sessionId) {
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
    const result = await this.authIssuerService.logout(sessionId);
    return {
      success: true,
      message: result.message,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const { user, issuerStatus } = await this.authIssuerService.getProfile((req as any).user.userId);
    return {
      success: true,
      data: { 
        user,
        issuerStatus: issuerStatus || 'no_application', // Returns: 'pending', 'approved', 'rejected', 'under_review', 'requires_more_info', or 'no_application'
      },
    };
  }

  @Post('resend-otp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Req() req: Request) {
    const result = await this.authIssuerService.resendOtp(req);
    return {
      success: true,
      message: result.message,
    };
  }


  @Post('kyc')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async kyc(@Req() req: Request) {
    const result = await this.authIssuerService.kyc(req);
    return {
      success: true,
      message: result.message,
    };
  }
}

