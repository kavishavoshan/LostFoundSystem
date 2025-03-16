import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostItem } from './lostitems.entity';
import { CreateLostItemDto } from './dto/lostitems.create-lost-items';

@Injectable()
export class LostItemService {
  constructor(
    @InjectRepository(LostItem)
    private lostItemRepository: Repository<LostItem>,
  ) {}

  async create(createLostItemDto: CreateLostItemDto): Promise<LostItem> {
    const lostItem = this.lostItemRepository.create(createLostItemDto);
    return this.lostItemRepository.save(lostItem);
  }

  async findAll(): Promise<LostItem[]> {
    return this.lostItemRepository.find();
  }

  async findOne(id: number): Promise<LostItem | null> {
    return this.lostItemRepository.findOneBy({ id });
  }
}
