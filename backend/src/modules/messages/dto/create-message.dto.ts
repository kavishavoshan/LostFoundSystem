import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsNumber()
  senderId: number;
} 