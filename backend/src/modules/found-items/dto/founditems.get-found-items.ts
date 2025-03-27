import { IsNumber, IsString } from 'class-validator';

export class GetFoundItemDto {
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
}