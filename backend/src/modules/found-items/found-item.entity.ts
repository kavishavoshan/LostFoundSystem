import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.entity';

export type FoundItemDocument = FoundItem & Document;

@Schema({ timestamps: true })
export class FoundItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [Number], required: false })
  clip_vector: number[];

  @Prop()
  createdAt: Date;
}

export const FoundItemSchema = SchemaFactory.createForClass(FoundItem); 