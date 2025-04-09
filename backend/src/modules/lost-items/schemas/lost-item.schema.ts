import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type LostItemDocument = LostItem & Document;

@Schema({ timestamps: true })
export class LostItem {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: 'lost' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
}

export const LostItemSchema = SchemaFactory.createForClass(LostItem); 