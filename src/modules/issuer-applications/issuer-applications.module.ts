import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IssuerApplicationsService } from './issuer-applications.service';
import { IssuerApplicationsController } from './issuer-applications.controller';
import {
  IssuerApplication,
  IssuerApplicationSchema,
} from './schemas/issuer-application.schema';
import { JwtAuthGuard } from '../auth_issuer/guards/jwt-auth.guard';
import { AuthIssuerModule } from '../auth_issuer/auth_issuer.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IssuerApplication.name, schema: IssuerApplicationSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'your-access-secret',
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    AuthIssuerModule,
  ],
  controllers: [IssuerApplicationsController],
  providers: [IssuerApplicationsService, JwtAuthGuard],
  exports: [IssuerApplicationsService],
})
export class IssuerApplicationsModule {}

