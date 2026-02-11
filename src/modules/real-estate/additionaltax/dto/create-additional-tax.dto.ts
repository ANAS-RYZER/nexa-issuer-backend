import {
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAdditionalTaxDto {
  @IsString({ message: 'Tax name must be a string' })
  @MinLength(1, { message: 'Tax name is required' })
  @MaxLength(100, { message: 'Tax name cannot exceed 100 characters' })
  name: string;

  @IsNumber({}, { message: 'Tax value must be a number' })
  @Min(0, { message: 'Tax value cannot be negative' })
  value: number;
}

