import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpvStatusController } from './spvStatus.controller';
import { SpvStatusService } from './spvStatus.service';
import { spvStatus, SpvStatusSchema } from '../schemas/spvstatus.schema';
import { SPV, SPVSchema } from '../schemas/spv.schema';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';
import { EmailModule } from '@/infra/email/email.module';
import { AdminModule } from '../../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: spvStatus.name, schema: SpvStatusSchema },
      { name: SPV.name, schema: SPVSchema },
    ]),
    AuthIssuerModule,
    EmailModule,
    AdminModule,
  ],
  controllers: [SpvStatusController],
  providers: [SpvStatusService],
  exports: [SpvStatusService],
})
export class SpvStatusModule {}
