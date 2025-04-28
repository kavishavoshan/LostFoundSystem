import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert, CreateDateColumn, UpdateDateColumn, BeforeUpdate } from 'typeorm';
import { Product } from '../product/product.entity';
import * as bcrypt from 'bcryptjs';
import { Message } from '../messages/message.entity';
import { FoundItem } from '../found-items/found-items.entity';
import { Logger } from '@nestjs/common'; // Import Logger

@Entity()
export class User {
  private static readonly logger = new Logger(User.name); // Add logger instance

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @BeforeInsert()
  async hashPassword() {
    User.logger.log(`BeforeInsert hook triggered for user email: ${this.email}`);
    User.logger.debug(`Password before hashing (first 3 chars): ${this.password ? this.password.substring(0, 3) : 'undefined'}...`);
    if (this.password) { // Ensure password exists before hashing
      this.password = await bcrypt.hash(this.password, 10);
      User.logger.debug(`Password after hashing (first 10 chars): ${this.password.substring(0, 10)}...`);
    } else {
      User.logger.warn(`Password was not provided for user ${this.email} during insert.`);
    }
  }

  // Add BeforeUpdate hook for completeness, although registration uses BeforeInsert
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Check if the password field is being updated
    // This requires more complex logic to check if 'password' is in the update set
    // For now, let's assume if the hook runs, we might need to re-hash if a plain password was somehow set.
    // A better approach involves checking the original entity state if possible or using a specific DTO for password updates.
    // Improved check: if password doesn't look like a bcrypt hash (checking both $2a$ and $2b$ prefixes), re-hash it.
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) { 
      User.logger.log(`BeforeUpdate hook triggered for user ID: ${this.id}. Re-hashing potentially plain password.`);
      this.password = await bcrypt.hash(this.password, 10);
      User.logger.debug(`Password after hashing in update (first 10 chars): ${this.password.substring(0, 10)}...`);
    }
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