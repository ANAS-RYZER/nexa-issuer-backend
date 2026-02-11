import { IsMongoId } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId({ message: 'Invalid asset ID format' })
  assetId: string;
}

export class AllocationIdParamDto {
  @IsMongoId({ message: 'Invalid allocation ID format' })
  allocationId: string;
}

