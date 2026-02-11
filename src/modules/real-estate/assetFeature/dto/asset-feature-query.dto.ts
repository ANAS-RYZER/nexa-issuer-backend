import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

export class FeatureIdParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  featureId: string;
}

