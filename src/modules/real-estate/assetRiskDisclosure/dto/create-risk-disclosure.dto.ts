import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateRiskDisclosureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

