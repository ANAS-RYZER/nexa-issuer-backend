import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class LocationQueryDto {
  @IsOptional()
  @IsString()
  @Length(2, 3)
  @Transform(({ value }) => value?.toUpperCase())
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Transform(({ value }) => value?.toUpperCase())
  state?: string;
}
