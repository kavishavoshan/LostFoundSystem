import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewsPage extends Document {
  @Prop({ required: true })
  headline: string;

  @Prop({ required: true })
  story: string;

  @Prop()
  imagePath?: string;

  @Prop({ default: false })
  published: boolean;
  
  createdAt: Date;
}

export const NewsPageSchema = SchemaFactory.createForClass(NewsPage);
