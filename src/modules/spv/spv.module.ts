import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SPVService } from './spv.service';
import { SPVController } from './spv.controller';
import { SPV, SPVSchema } from './schemas/spv.schema';
import { SpvStatusModule } from './spvStatus/spvStatus.module';
import { spvStatus, SpvStatusSchema } from './schemas/spvstatus.schema';
import { IssuerUser, IssuerUserSchema } from '../authIssuer/schemas/issuer-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SPV.name, schema: SPVSchema },
      { name: spvStatus.name, schema: SpvStatusSchema },
      { name: IssuerUser.name, schema: IssuerUserSchema },
    ]),
    JwtModule.register({}), 
    ConfigModule, 
    SpvStatusModule, 
  ],
  controllers: [SPVController],
  providers: [SPVService],
  exports: [SPVService],
})
export class SPVModule {}
