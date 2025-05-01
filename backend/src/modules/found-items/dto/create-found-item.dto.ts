import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFoundItemDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) return null;
    if (value instanceof Buffer) return value;
    if (typeof value === 'string') return Buffer.from(value);
    return value;
  })
  image?: Buffer | null;

  @IsString()
  @IsOptional()
  imageContentType?: string | null;

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