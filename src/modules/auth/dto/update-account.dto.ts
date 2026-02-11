import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsEnum, MinLength, MaxLength } from 'class-validator';


export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

