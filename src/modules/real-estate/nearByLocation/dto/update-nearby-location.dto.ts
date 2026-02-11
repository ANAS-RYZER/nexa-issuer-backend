import { IsBoolean, IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { LocationType } from '../../schema/nearByLocation.model';

export class UpdateNearByLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceInKm?: number;

  @IsOptional()
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

