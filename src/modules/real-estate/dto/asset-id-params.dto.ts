import { IsString, Matches } from 'class-validator';

export class AssetIdParamsDto {
  @IsString({ message: 'Asset ID must be a string' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid asset ID format' })
  assetId: string;
}
