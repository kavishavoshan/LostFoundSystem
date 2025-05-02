import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { LostItem } from './lost-item.entity';
import { CreateLostItemDto } from './dto/create-lost-item.dto';
import { UpdateLostItemDto } from './dto/update-lost-item.dto';
import { LostItemResponse } from './types/lost-item.types';

type LostItemDocument = LostItem & Document;

@Injectable()
export class LostItemsService {
  constructor(
    @InjectModel(LostItem.name) private lostItemModel: Model<LostItemDocument>,
  ) {}

  async create(createLostItemDto: CreateLostItemDto): Promise<LostItemResponse> {
    const createdLostItem = new this.lostItemModel({
      ...createLostItemDto,
      image: createLostItemDto.image ? Buffer.from(createLostItemDto.image) : null
    });
    const savedItem = await createdLostItem.save();
    return this.convertToResponse(savedItem);
  }

  async findAll(): Promise<LostItemResponse[]> {
    const items = await this.lostItemModel.find().exec();
    return items.map(item => this.convertToResponse(item));
  }

  async findOne(id: string): Promise<LostItemResponse> {
    const lostItem = await this.lostItemModel.findById(id).exec();
    if (!lostItem) {
      throw new NotFoundException(`Lost item with Id ${id} not found`);
    }
    return this.convertToResponse(lostItem);
  }

  async findByUser(userId: string): Promise<LostItemResponse[]> {
    const items = await this.lostItemModel.find({ userId }).exec();
    return items.map(item => this.convertToResponse(item));
  }

  async update(id: string, updateLostItemDto: UpdateLostItemDto): Promise<LostItemResponse> {
    const updatedLostItem = await this.lostItemModel
      .findByIdAndUpdate(id, {
        ...updateLostItemDto,
        image: updateLostItemDto.image ? Buffer.from(updateLostItemDto.image) : undefined
      }, { new: true })
      .exec();
    if (!updatedLostItem) {
      throw new NotFoundException(`Lost item with Id ${id} not found`);
    }
    return this.convertToResponse(updatedLostItem);
  }

  async remove(id: string): Promise<LostItemResponse> {
    const deletedLostItem = await this.lostItemModel.findByIdAndDelete(id).exec();
    if (!deletedLostItem) {
      throw new NotFoundException(`Lost item with ID ${id} not found`);
    }
    return this.convertToResponse(deletedLostItem);
  }

  private convertToResponse(item: LostItemDocument): LostItemResponse {
    const doc = item.toObject();
    return {
      ...doc,
      _id: doc._id.toString(),
      image: doc.image ? `data:${doc.imageContentType};base64,${doc.image.toString('base64')}` : null,
      createdAt: doc.createdAt || new Date(),
      imageContentType: doc.imageContentType || 'image/jpeg'
    };
  }
}
