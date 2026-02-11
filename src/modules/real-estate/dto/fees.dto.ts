import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { FeeType } from '../interfaces/assetFeeConfig.types';

export class CreateAssetFeeConfigDto {
  @IsEnum(FeeType, {
    message: `Fee type must be one of: ${Object.values(FeeType).join(', ')}`,
  })
  type: FeeType;

  @IsString({ message: 'Fee name must be a string' })
  @MinLength(1, { message: 'Fee name is required' })
  @MaxLength(100, { message: 'Fee name must be less than 100 characters' })
  name: string;

  @IsNumber({}, { message: 'Fee value must be a number' })
  @Min(0, { message: 'Fee value must be a positive number' })
  value: number;

  @IsBoolean({ message: 'isPercentage must be a boolean' })
  isPercentage: boolean;

  @IsBoolean({ message: 'status must be a boolean' })
  status: boolean;
}

export class UpdateAssetFeeConfigDto {
  @IsOptional()
  @IsEnum(FeeType, {
    message: `Fee type must be one of: ${Object.values(FeeType).join(', ')}`,
  })
  type?: FeeType;

  @IsOptional()
  @IsString({ message: 'Fee name must be a string' })
  @MinLength(1, { message: 'Fee name is required' })
  @MaxLength(100, { message: 'Fee name must be less than 100 characters' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Fee value must be a number' })
  @Min(0, { message: 'Fee value must be a positive number' })
  value?: number;

  @IsOptional()
  @IsBoolean({ message: 'isPercentage must be a boolean' })
  isPercentage?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'status must be a boolean' })
  status?: boolean;
}

export class AssetIdQueryDto {
  @IsString({ message: 'Asset ID must be a string' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid asset ID format' })
  assetId: string;
}

export class FeeConfigIdParamsDto {
  @IsString({ message: 'Fee config ID must be a string' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid fee config ID format' })
  feeConfigId: string;
}

export class GetAssetFeeConfigsQueryDto {
  @IsString({ message: 'Asset ID must be a string' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid asset ID format' })
  assetId: string;

  @IsOptional()
  @IsEnum(FeeType, {
    message: `Fee type must be one of: ${Object.values(FeeType).join(', ')}`,
  })
  feeType?: FeeType;
}
