import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthIssuerController } from './auth_issuer.controller';
import { AuthIssuerService } from './auth_issuer.service';
import { IssuerUser, IssuerUserSchema } from './schemas/issuer-user.schema';
import { IssuerApplication, IssuerApplicationSchema } from '../issuer-applications/schemas/issuer-application.schema';
import { JwtTokenService } from './services/jwt.service';
import { TokenStorageService } from './services/token-storage.service';
import { OtpService } from './services/otp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IssuerUser.name, schema: IssuerUserSchema },
      { name: IssuerApplication.name, schema: IssuerApplicationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthIssuerController],
  providers: [
    AuthIssuerService,
    JwtTokenService,
    TokenStorageService,
    OtpService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
  ],
  exports: [
    AuthIssuerService,
    JwtAuthGuard,
    JwtModule,
    MongooseModule, 
  ],
})
export class AuthIssuerModule {}


