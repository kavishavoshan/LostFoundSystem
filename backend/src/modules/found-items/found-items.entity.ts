<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class FoundItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemName: string;

  @Column()
  imageUrl: string;

  @Column()
  foundLocation: string;

  @Column()
  contactNumber: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.foundItems, { onDelete: 'CASCADE' })
  finder: User;
}
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.entity';

export type FoundItemDocument = FoundItem & Document;

@Schema({ timestamps: true })
export class FoundItem {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  imageUrl: string;

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
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
