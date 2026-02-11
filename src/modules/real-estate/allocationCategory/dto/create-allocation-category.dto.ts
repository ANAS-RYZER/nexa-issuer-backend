import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { VestingType } from '../../interfaces/assetAllocationCategory.types';

export class CreateAllocationCategoryDto {
  @IsString({ message: 'Category name must be a string' })
  @MinLength(1, { message: 'Category name is required' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  category: string;

  @IsNumber({}, { message: 'Tokens must be a number' })
  @Min(1, { message: 'Tokens must be greater than 0' })
  tokens: number;

  @IsEnum(VestingType, { message: 'Invalid vesting type' })
  vestingType: VestingType;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid vesting start date format' })
  vestingStartDate?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid vesting end date format' })
  vestingEndDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'Cliff period must be a number' })
  @Min(0, { message: 'Cliff period cannot be negative' })
  cliffPeriod?: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

