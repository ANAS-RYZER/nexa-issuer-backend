import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KybService } from './kyb.service';
import { KybController } from './kyb.controller';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    ConfigModule,
    AuthIssuerModule,
  ],
  controllers: [KybController],
  providers: [KybService],
})
export class KybModule {}