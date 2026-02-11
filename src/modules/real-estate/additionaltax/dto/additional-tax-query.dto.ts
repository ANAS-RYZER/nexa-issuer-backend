import { IsMongoId } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId({ message: 'Invalid asset ID format' })
  assetId: string;
}

export class TaxIdParamDto {
  @IsMongoId({ message: 'Invalid tax ID format' })
  taxId: string;
}

