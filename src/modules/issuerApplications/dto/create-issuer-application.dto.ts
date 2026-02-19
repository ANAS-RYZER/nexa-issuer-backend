import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  MinLength,
  MaxLength,
  IsObject,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { AssetCategory } from '../schemas/issuer-application.schema';

export class CreateIssuerApplicationDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/, {
    message: 'Please provide a valid phone number',
  })
  phoneNumber?: string;

  @IsString()
  @MinLength(2, { message: 'Legal entity name must be at least 2 characters' })
  @MaxLength(200)
  legalEntityName: string;

  @IsString()
  @MinLength(2, { message: 'Country of incorporation is required' })
  @MaxLength(100)
  countryOfIncorporation: string;


  @IsEnum(AssetCategory, {
    message: `Asset category must be one of: ${Object.values(AssetCategory).join(', ')}`,
  })
  assetCategory: AssetCategory;

  @IsNotEmpty({ message: 'Phone number is required' })
  phoneCountryCode: string;

  @IsString()
  @MinLength(10, { message: 'Short asset description must be at least 10 characters' })
  @MaxLength(10000)
  shortAssetDescription: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

