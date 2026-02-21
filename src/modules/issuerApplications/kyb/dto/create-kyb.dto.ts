import { IsString, Length } from 'class-validator';

export class CreateKybCompanyDto {
  @IsString()
  @Length(2, 120)
  companyName: string;

  @IsString()
  @Length(2, 3)
  country: string;
}