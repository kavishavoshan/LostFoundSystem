import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class NewsPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  headline: string;

  @Column('text')
  story: string;

  @Column({ nullable: true })
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  published: boolean;
}