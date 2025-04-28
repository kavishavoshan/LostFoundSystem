import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sentMessages, { eager: true })
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages, { eager: true })
  receiver: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  read: boolean;
}