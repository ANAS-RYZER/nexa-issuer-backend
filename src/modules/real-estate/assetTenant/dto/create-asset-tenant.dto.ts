import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus, TenantType } from '../../interfaces/assetTenant.types';

class AgreementDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  url?: string | null;
}

export class CreateAssetTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0.01)
  rentPerSft: number;

  @IsNumber()
  @Min(1)
  sftsAllocated: number;

  @IsNumber()
  @Min(0)
  annualRentEscalation: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsEnum(TenantType)
  @IsNotEmpty()
  type: TenantType;

  @IsNumber()
  @Min(0)
  lockInPeriod: number;

  @IsNumber()
  @Min(0)
  leasePeriod: number;

  @IsNumber()
  @Min(0)
  securityDeposit: number;

  @IsNumber()
  @Min(0)
  interestOnSecurityDeposit: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AgreementDto)
  agreement?: AgreementDto | null;

  @IsOptional()
  @IsString()
  logo?: string | null;
}

