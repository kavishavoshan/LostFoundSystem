<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LostItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemName: string;

  @Column()
  imageUrl: string;

  @Column()
  lostLocation: string;

  @Column()
  contactNumber: string;

  @Column()
  description: string;
}
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LostItemDocument = LostItem & Document;

@Schema({ timestamps: true })
export class LostItem {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  lostLocation: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  description: string;
}

export const LostItemSchema = SchemaFactory.createForClass(LostItem);
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
