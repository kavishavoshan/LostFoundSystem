import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundItem } from './found-items.entity';
import { CreateFoundItemDto } from './dto/founditems.create-found-items';

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
}
