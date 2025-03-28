import { IsNumber, IsString } from 'class-validator';

export class GetLostItemDto {
  @IsNumber()
  id: number;

  @IsString()
  itemName: string;

  @IsString()
  imageUrl: string;

  @IsString()
  lostLocation: string;

  @IsString()
  contactNumber: string;

  @IsString()
  description: string;
}