import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundItem } from './found-items.entity';
import { CreateFoundItemDto } from './dto/founditems.create-found-items';
import { UpdateFoundItemDto } from './dto/founditems.update-found-item';

@Injectable()
export class FoundItemService {
  constructor(
    @InjectRepository(FoundItem)
    private foundItemRepository: Repository<FoundItem>,
  ) {}

  async create(createFoundItemDto: CreateFoundItemDto): Promise<FoundItem> {
    const foundItem = this.foundItemRepository.create(createFoundItemDto);
    return this.foundItemRepository.save(foundItem);
  }

  async findAll(): Promise<FoundItem[]> {
    return this.foundItemRepository.find();
  }

  async findOne(id: number): Promise<FoundItem | null> {
    return this.foundItemRepository.findOneBy({ id });
  }

    async update(id: number, updateFoundItemDto: UpdateFoundItemDto): Promise<FoundItem> {
      const item = await this.foundItemRepository.findOneBy({ id });
      if (!item) throw new Error(`Found item with id ${id} not found`);
    
      const updated = Object.assign(item, updateFoundItemDto);
      return this.foundItemRepository.save(updated);
    }
    
    async remove(id: number): Promise<{ message: string }> {
      const result = await this.foundItemRepository.delete(id);
      if (result.affected === 0) throw new Error(`Found item with id ${id} not found`);
      return { message: `Found item with id ${id} deleted successfully` };
    }
}
