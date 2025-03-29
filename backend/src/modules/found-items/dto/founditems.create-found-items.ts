import { IsString } from 'class-validator';

export class CreateFoundItemDto {
  @IsString()
  itemName: string;

  @IsString()
  imageUrl: string;

  @IsString()
  foundLocation: string;

  @IsString()
  contactNumber: string;

  @IsString()
  description: string;
}