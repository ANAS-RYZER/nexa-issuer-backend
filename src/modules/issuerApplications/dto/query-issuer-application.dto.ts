import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory, ApplicationStatus } from '../schemas/issuer-application.schema';

export class QueryIssuerApplicationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: `Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(AssetCategory, {
    message: `Asset category must be one of: ${Object.values(AssetCategory).join(', ')}`,
  })
  assetCategory?: AssetCategory;

  @IsOptional()
  @IsString()
  countryOfIncorporation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
