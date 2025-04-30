import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[0-9]{1,4}[0-9]{9,}$/, { message: 'Mobile number must include country code and be valid' })
  mobileNumber: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
