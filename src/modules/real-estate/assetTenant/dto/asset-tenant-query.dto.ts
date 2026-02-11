import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

export class TenantIdParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;
}

