import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { AssetCategory, ApplicationStatus } from '../schemas/issuer-application.schema';

export class UpdateIssuerApplicationDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Legal entity name must be at least 2 characters' })
  @MaxLength(200)
  legalEntityName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Country of incorporation is required' })
  @MaxLength(100)
  countryOfIncorporation?: string;


  @IsOptional()
  @IsEnum(AssetCategory, {
    message: `Asset category must be one of: ${Object.values(AssetCategory).join(', ')}`,
  })
  assetCategory?: AssetCategory;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Short asset description must be at least 10 characters' })
  @MaxLength(1000)
  shortAssetDescription?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: `Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

