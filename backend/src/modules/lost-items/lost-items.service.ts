import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostItem } from './lostitems.entity';
import { CreateLostItemDto } from './dto/lostitems.create-lost-items';
import { UpdateLostItemDto } from './dto/lostitems.update-lost-items';

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

  async update(id: number, updateLostItemDto: UpdateLostItemDto): Promise<LostItem> {
    const item = await this.lostItemRepository.findOneBy({ id });
    if (!item) throw new Error(`Lost item with id ${id} not found`);
  
    const updated = Object.assign(item, updateLostItemDto);
    return this.lostItemRepository.save(updated);
  }
  
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.lostItemRepository.delete(id);
    if (result.affected === 0) throw new Error(`Lost item with id ${id} not found`);
    return { message: `Lost item with id ${id} deleted successfully` };
  }
}
