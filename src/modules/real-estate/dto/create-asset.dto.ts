import {
  IsString,
  IsEnum,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import {
  AssetClass,
  AssetCategory,
  AssetStage,
  AssetStyle,
  InstrumentType,
} from '../interfaces/asset.type';

export class CreateAssetDto {
  @IsEnum(AssetClass, {
    message: `Asset class must be one of: ${Object.values(AssetClass).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Asset class is required' })
  class?: AssetClass;

  @IsEnum(AssetCategory, {
    message: `Asset category must be one of: ${Object.values(AssetCategory).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Asset category is required' })
  category: AssetCategory;

  @IsEnum(AssetStage, {
    message: `Asset stage must be one of: ${Object.values(AssetStage).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Asset stage is required' })
  stage: AssetStage;

  @IsEnum(AssetStyle, {
    message: `Asset style must be one of: ${Object.values(AssetStyle).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Asset style is required' })
  style: AssetStyle;

  @IsString({ message: 'SPV ID must be a string' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid company ID format' })
  @IsNotEmpty({ message: 'Company ID is required' })
  spvId: string;

  @IsOptional()
  spv?: any;

  @IsString({ message: 'Currency must be a string' })
  @MinLength(1, { message: 'Currency is required' })
  @MaxLength(5, { message: 'Currency code must be less than 5 characters' })
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @IsEnum(InstrumentType, {
    message: `Instrument type must be one of: ${Object.values(InstrumentType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Instrument type is required' })
  instrumentType: InstrumentType;

  @IsString({ message: 'Property name must be a string' })
  @MinLength(1, { message: 'Property name is required' })
  @MaxLength(100, { message: 'Property name must be less than 100 characters' })
  @IsNotEmpty({ message: 'Property name is required' })
  name: string;

  @IsString({ message: 'About section must be a string' })
  @MinLength(1, { message: 'About section is required' })
  @IsNotEmpty({ message: 'About section is required' })
  about: string;

  @IsString({ message: 'Country must be a string' })
  @MinLength(1, { message: 'Country is required' })
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @IsString({ message: 'State must be a string' })
  @MinLength(1, { message: 'State is required' })
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString({ message: 'City must be a string' })
  @MinLength(1, { message: 'City is required' })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString({ message: 'Landmark must be a string' })
  @MinLength(1, { message: 'Landmark is required' })
  @IsNotEmpty({ message: 'Landmark is required' })
  landmark: string;
}
