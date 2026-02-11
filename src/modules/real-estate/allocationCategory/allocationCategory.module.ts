import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllocationCategoryController } from './allocationCategory.controller';
import { AllocationCategoryService } from './allocationCategory.service';
import {
  AssetAllocationCategory,
  AssetAllocationCategorySchema,
} from '../schema/assetAllocationCategory.model';
import { Asset, AssetSchema } from '../schema/asset.model';
import { AuthIssuerModule } from '@/modules/auth_issuer/auth_issuer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetAllocationCategory.name, schema: AssetAllocationCategorySchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    AuthIssuerModule,
  ],
  controllers: [AllocationCategoryController],
  providers: [AllocationCategoryService],
  exports: [AllocationCategoryService],
})
export class AllocationCategoryModule {}

