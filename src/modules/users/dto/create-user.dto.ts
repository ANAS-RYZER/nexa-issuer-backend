import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'Phone number must be in valid international format' 
  })
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isKycVerified?: boolean;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatar?: string;
}

