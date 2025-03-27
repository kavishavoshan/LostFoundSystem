import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
