import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoundItem } from './schemas/found-item.schema';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto';

@Injectable()
export class FoundItemsService {
  constructor(
    @InjectModel(FoundItem.name) private foundItemModel: Model<FoundItem>,
  ) {}

  async create(createFoundItemDto: CreateFoundItemDto): Promise<FoundItem> {
    const createdFoundItem = new this.foundItemModel(createFoundItemDto);
    return createdFoundItem.save();
  }

  async findAll(): Promise<FoundItem[]> {
    return this.foundItemModel.find().exec();
  }

  async findOne(id: string): Promise<FoundItem> {
    const foundItem = await this.foundItemModel.findById(id).exec();
    if (!foundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return foundItem;
  }

  async findByUser(userId: string): Promise<FoundItem[]> {
    return this.foundItemModel.find({ userId }).exec();
  }

  async update(id: string, updateFoundItemDto: UpdateFoundItemDto): Promise<FoundItem> {
    const updatedFoundItem = await this.foundItemModel
      .findByIdAndUpdate(id, updateFoundItemDto, { new: true })
      .exec();
    if (!updatedFoundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return updatedFoundItem;
  }

  async remove(id: string): Promise<FoundItem> {
    const deletedFoundItem = await this.foundItemModel.findByIdAndDelete(id).exec();
    if (!deletedFoundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return deletedFoundItem;
  }

    // async update(id: number, updateFoundItemDto: UpdateFoundItemDto): Promise<FoundItem> {
    //   const item = await this.foundItemRepository.findOneBy({ id });
    //   if (!item) throw new Error(`Found item with id ${id} not found`);
    
    //   const updated = Object.assign(item, updateFoundItemDto);
    //   return this.foundItemRepository.save(updated);
    // }
    
    // async remove(id: number): Promise<{ message: string }> {
    //   const result = await this.foundItemRepository.delete(id);
    //   if (result.affected === 0) throw new Error(`Found item with id ${id} not found`);
    //   return { message: `Found item with id ${id} deleted successfully` };
    // }
}
