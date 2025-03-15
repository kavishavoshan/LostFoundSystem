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
}
