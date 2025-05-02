import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LostItemDocument = LostItem & Document;

@Schema({ timestamps: true })
export class LostItem {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  lostLocation: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  description: string;
}

export const LostItemSchema = SchemaFactory.createForClass(LostItem);
