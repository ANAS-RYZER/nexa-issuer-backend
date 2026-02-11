import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAssetExpenseDto {
  @IsString({ message: 'Expense name must be a string' })
  @MinLength(1, { message: 'Expense name is required' })
  @MaxLength(100, { message: 'Expense name cannot exceed 100 characters' })
  name: string;

  @IsNumber({}, { message: 'Expense value must be a number' })
  @Min(0, { message: 'Expense value cannot be negative' })
  value: number;

  @IsBoolean({ message: 'isPercentage must be a boolean' })
  isPercentage: boolean;

  @IsOptional()
  @IsBoolean({ message: 'status must be a boolean' })
  status?: boolean;
}

