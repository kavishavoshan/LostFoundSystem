import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFoundItemDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value instanceof Buffer) return value;
    if (typeof value === 'string') return Buffer.from(value);
    return value;
  })
  image: Buffer;

  @IsString()
  @IsNotEmpty()
  imageContentType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  clip_vector?: number[];
}