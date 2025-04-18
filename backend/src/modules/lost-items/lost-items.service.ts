import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LostItem } from './schemas/lost-item.schema';
import { CreateLostItemDto } from './dto/create-lost-item.dto';
import { UpdateLostItemDto } from './dto/update-lost-item.dto';

@Injectable()
export class LostItemsService {
  constructor(
    @InjectModel(LostItem.name) private lostItemModel: Model<LostItem>,
  ) {}

  async create(createLostItemDto: CreateLostItemDto): Promise<LostItem> {
    const createdLostItem = new this.lostItemModel(createLostItemDto);
    return createdLostItem.save();
  }

  async findAll(): Promise<LostItem[]> {
    console.log(this.lostItemModel.find().exec());
    return this.lostItemModel.find().exec();
  }

  async findOne(id: string): Promise<LostItem> {
    const lostItem = await this.lostItemModel.findById(id).exec();
    if (!lostItem) {
      throw new NotFoundException(`Lost item with ID ${id} not found`);
    }
    return lostItem;
  }

  async findByUser(userId: string): Promise<LostItem[]> {
    return this.lostItemModel.find({ userId }).exec();
  }

  async update(id: string, updateLostItemDto: UpdateLostItemDto): Promise<LostItem> {
    const updatedLostItem = await this.lostItemModel
      .findByIdAndUpdate(id, updateLostItemDto, { new: true })
      .exec();
    if (!updatedLostItem) {
      throw new NotFoundException(`Lost item with ID ${id} not found`);
    }
    return updatedLostItem;
  }

  async remove(id: string): Promise<LostItem> {
    const deletedLostItem = await this.lostItemModel.findByIdAndDelete(id).exec();
    if (!deletedLostItem) {
      throw new NotFoundException(`Lost item with ID ${id} not found`);
    }
    return deletedLostItem;
  }

  // async update(id: number, updateLostItemDto: UpdateLostItemDto): Promise<LostItem> {
  //   const item = await this.lostItemRepository.findOneBy({ id });
  //   if (!item) throw new Error(`Lost item with id ${id} not found`);
  
  //   const updated = Object.assign(item, updateLostItemDto);
  //   return this.lostItemRepository.save(updated);
  // }
  
  // async remove(id: number): Promise<{ message: string }> {
  //   const result = await this.lostItemRepository.delete(id);
  //   if (result.affected === 0) throw new Error(`Lost item with id ${id} not found`);
  //   return { message: `Lost item with id ${id} deleted successfully` };
  // }
}
