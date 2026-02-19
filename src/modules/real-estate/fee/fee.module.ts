import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetModule } from '../real-estate.module';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import {
  AssetFeeConfig,
  AssetFeeConfigSchema,
} from '../schema/assetFeeConfig.model';
import { AuthIssuerModule } from '../../authIssuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetFeeConfig.name, schema: AssetFeeConfigSchema },
    ]),
    AuthIssuerModule,
    forwardRef(() => AssetModule),
  ],
  controllers: [FeeController],
  providers: [FeeService],
  exports: [FeeService],
})
export class FeeModule {}