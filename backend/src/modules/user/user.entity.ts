import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import * as bcrypt from 'bcryptjs';
import { Message } from '../messages/message.entity';
import { FoundItem } from '../found-items/found-items.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => FoundItem, foundItem => foundItem.finder)
  foundItems: FoundItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}