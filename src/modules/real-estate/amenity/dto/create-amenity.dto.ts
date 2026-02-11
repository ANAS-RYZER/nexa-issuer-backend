import {
  IsString,
  IsBoolean,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateAmenityDto {
  @IsString({ message: 'Amenity name must be a string' })
  @MinLength(1, { message: 'Amenity name is required' })
  @MaxLength(100, { message: 'Amenity name cannot exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsString({ message: 'Image URL must be a string' })
  @MinLength(1, { message: 'Image is required' })
  image: string;

  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean' })
  status?: boolean;
}

