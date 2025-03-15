import { IsString } from 'class-validator';

export class CreateLostItemDto {
  @IsString()
  itemName: string;

  @IsString()
  imageUrl: string;

  @IsString()
  lostLocation: string;

  @IsString()
  contactNumber: string;
}