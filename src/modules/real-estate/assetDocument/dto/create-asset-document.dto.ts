import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EAssetDocumentType, EAssetDocumentFormat } from '../../interfaces/assetDocument.types';

class DocumentUrlDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateAssetDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(EAssetDocumentType)
  @IsNotEmpty()
  type: EAssetDocumentType;

  @IsOptional()
  @IsEnum(EAssetDocumentFormat)
  format?: EAssetDocumentFormat;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentUrlDto)
  document?: DocumentUrlDto;

  @IsOptional()
  @IsBoolean()
  isProtected?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

