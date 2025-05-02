import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.entity';

export type FoundItemDocument = FoundItem & Document;

@Schema({ timestamps: true })
export class FoundItem {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  foundLocation: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  finder: User;
}

export const FoundItemSchema = SchemaFactory.createForClass(FoundItem);
