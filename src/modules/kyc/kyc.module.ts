import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { KycVerification, KycVerificationSchema } from './schemas/kyc-verification.schema';
import { AuthModule } from '../auth/auth.module';
import { SUMSUB_CONFIG, SumsubConfig } from './config/sumsub.config';

@Module({
  imports: [
    // Configuration Module
    ConfigModule,
    
    // Database
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: KycVerification.name, schema: KycVerificationSchema },
    ]),
    
    // Authentication
    AuthModule, // For JwtAuthGuard
  ],
  
  controllers: [KycController],
  
  providers: [
    // Sumsub Configuration Provider (Similar to JWT configuration)
    {
      provide: SUMSUB_CONFIG,
      useFactory: (configService: ConfigService): SumsubConfig => {
        const appToken = configService.get<string>('SUMSUB_APP_TOKEN');
        const appSecret = configService.get<string>('SUMSUB_SECRET_KEY');
        
        const config: SumsubConfig = {
          appToken: appToken || '',
          appSecret: appSecret || '',
          apiUrl: 'https://api.sumsub.com',
          isConfigured: !!(appToken && appSecret),
        };
        return config;
      },
      inject: [ConfigService],
    },
    
    // Services
    KycService,
  ],
  
  exports: [
    KycService,
    SUMSUB_CONFIG, // Export config for use in other modules
  ],
})
export class KycModule {}

