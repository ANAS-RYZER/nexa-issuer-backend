import { IsNumber, IsString, IsNotEmpty, Min, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsNumber({}, { message: 'Number of tokens must be a number' })
  @Min(1, { message: 'Number of tokens must be at least 1' })
  numberOfTokens: number;

  @IsNumber({}, { message: 'Investor paid amount must be a number' })
  @Min(1, { message: 'Investor paid amount must be at least 1' })
  investorPaidAmount: number; // sent in investor currency

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency is required' })
  @MaxLength(10, { message: 'Currency cannot exceed 10 characters' })
  investorCurrency: string; // investor's currency

  @IsNumber({}, { message: 'Token value must be a number' })
  @Min(1, { message: 'Token value must be at least 1' })
  tokenValue: number; // price per token in asset currency
}