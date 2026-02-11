import {
  IsString,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

export class CreateDueDiligenceLegalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  logoUrl: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;
}

