import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, Length, ValidateIf } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
  @Matches(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/, { message: 'Please provide a valid phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;
  @IsString()
  @IsNotEmpty({ message: 'Country code is required' })
  countryCode: string;
  
  @IsOptional()
  @ValidateIf((o) => o.otp !== undefined && o.otp !== null && o.otp !== '')
  @IsString({ message: 'OTP must be a string' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp?: string;
}

