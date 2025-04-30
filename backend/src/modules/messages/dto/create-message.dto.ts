import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsOptional()
  @IsString()
  senderId?: string;
}