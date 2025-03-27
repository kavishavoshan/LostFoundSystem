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

  @ManyToOne(() => User, (user) => user.foundItems, { onDelete: 'CASCADE' })
  finder: User;
}
