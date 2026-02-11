import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infra/database/database.module';
import { EmailModule } from './infra/email/email.module';
import { IssuerApplicationsModule } from './modules/issuerApplications/issuer-applications.module';
import { AuthIssuerModule } from './modules/authIssuer/auth_issuer.module';
import { AuthModule } from './modules/auth/auth.module';
import { KycModule } from './modules/kyc/kyc.module';
import { SPVModule } from './modules/spv/spv.module';
import { AssetModule } from './modules/real-estate/real-estate.module';
import { UploadModule } from './modules/upload/upload.module';
import { LocationsModule } from './modules/locations/location.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Infrastructure
    DatabaseModule,
    EmailModule,

    // Feature Modules
    IssuerApplicationsModule,
    AuthIssuerModule,
    AuthModule, // User authentication (toker-auth)
    KycModule, // Sumsub KYC integration
    SPVModule,
    AssetModule,
    UploadModule,
    LocationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
