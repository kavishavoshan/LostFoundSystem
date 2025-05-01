import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;
  
  @Prop({ type: Date, default: null })
  readAt: Date;
  
  @Prop({ type: String, default: null })
  attachmentUrl: string;
  
  @Prop({ type: Boolean, default: false })
  isEdited: boolean;
  
  @Prop({ type: Date, default: null })
  editedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);