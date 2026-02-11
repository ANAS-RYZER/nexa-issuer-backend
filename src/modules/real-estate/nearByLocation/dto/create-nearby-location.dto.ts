import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../../schema/nearByLocation.model';

export class CreateNearByLocationItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  locationType: LocationType;

  @IsNumber()
  @Min(0)
  distanceInKm: number;

  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsString()
  @IsNotEmpty()
  longitude: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateNearByLocationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNearByLocationItemDto)
  locations: CreateNearByLocationItemDto[];
}

