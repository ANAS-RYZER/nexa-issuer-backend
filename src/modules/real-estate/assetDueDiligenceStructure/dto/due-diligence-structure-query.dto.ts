import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

export class DueDiligenceStructureIdParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  dueDiligenceStructureId: string;
}

