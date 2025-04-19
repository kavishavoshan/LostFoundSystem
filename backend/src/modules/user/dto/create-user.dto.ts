<<<<<<< HEAD
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
=======
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
<<<<<<< HEAD
=======

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
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
}
