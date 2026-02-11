import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateRiskFactorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

