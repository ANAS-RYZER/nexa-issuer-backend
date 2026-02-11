import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTermsAndConditionsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

