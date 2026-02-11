import { IsOptional, IsInt, Min, Max, IsIn, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PublicAssetListQueryDto {
  // ========== PAGINATION ==========
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  // ========== SORTING ==========
  // Advanced sorting (takes precedence)
  @IsOptional()
  @IsIn(['high-returns', 'low-returns', 'newest'], {
    message: 'Sort must be one of: high-returns, low-returns, newest',
  })
  sort?: 'high-returns' | 'low-returns' | 'newest';

  // Standard sorting (fallback)
  @IsOptional()
  @IsIn(['createdAt', 'name', 'bookmarks', 'basePropertyValue'], {
    message: 'sortBy must be one of: createdAt, name, bookmarks, basePropertyValue',
  })
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder must be either asc or desc',
  })
  sortOrder?: 'asc' | 'desc';

  // ========== FILTERS ==========
  // Asset status filter (active, completed, waitlist)
  @IsOptional()
  @IsIn(['active', 'completed', 'waitlist'], {
    message: 'assetStatus must be one of: active, completed, waitlist',
  })
  assetStatus?: 'active' | 'completed' | 'waitlist';

  // Category filter
  @IsOptional()
  @IsString()
  category?: string;

  // Class filter
  @IsOptional()
  @IsString()
  class?: string;

  // Location filters
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Price range filters
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minPrice must be a valid number' })
  @Min(0, { message: 'minPrice must be at least 0' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice must be a valid number' })
  @Min(0, { message: 'maxPrice must be at least 0' })
  maxPrice?: number;

  // ========== SEARCH ==========
  // Search across multiple fields
  @IsOptional()
  @IsString()
  search?: string;
}

