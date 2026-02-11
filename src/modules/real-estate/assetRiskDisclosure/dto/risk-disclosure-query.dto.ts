import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

export class RiskDisclosureIdParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  riskDisclosureId: string;
}

