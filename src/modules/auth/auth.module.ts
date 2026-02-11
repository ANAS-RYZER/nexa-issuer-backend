import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from '../../infra/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenStorageService } from './services/token-storage.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EmailOTP, EmailOTPSchema } from './schemas/email-otp.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailOTP.name, schema: EmailOTPSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get('TOKER_JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('TOKER_JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    EmailModule, // Email service for sending OTPs
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenStorageService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    JwtModule,
    MongooseModule,
  ],
})
export class AuthModule {}

