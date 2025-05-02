import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsUrl, IsDate } from 'class-validator';

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
  
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
  
  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
  
  @IsOptional()
  @IsDate()
  editedAt?: Date;
}