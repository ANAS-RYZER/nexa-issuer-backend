import { IsOptional, IsString, IsInt, Min, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SPVType, CompanyStatus } from '../schemas/spv.schema';

export class QuerySPVListDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : undefined;
  })
  @IsArray()
  @IsEnum(SPVType, { each: true })
  type?: SPVType[];

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export interface SPVListItem {
  _id: string;
  name: string;
  type: string;
  status: string;
  logo?: string;
  currency: string;
  OnchainAddress?: string;
  aum: number; // Assets Under Management
  totalInvestors: number; // Unique investor count
  completedSteps: string[];
  completedStepsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedSPVListResponse {
  data: SPVListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

