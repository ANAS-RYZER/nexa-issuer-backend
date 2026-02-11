import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AssetStatus } from '../interfaces/asset.type';

export class AdminAssetListingQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

