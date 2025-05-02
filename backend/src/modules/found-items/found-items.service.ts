import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoundItem } from './found-item.entity';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto';
import { FoundItemResponse } from './types/found-item.types';

type FoundItemDocument = FoundItem & Document & { toObject(): any };

@Injectable()
export class FoundItemsService {
  constructor(
    @InjectModel(FoundItem.name) private foundItemModel: Model<FoundItemDocument>,
  ) {}

  async create(createFoundItemDto: CreateFoundItemDto): Promise<FoundItemResponse> {
    const createdFoundItem = new this.foundItemModel({
      ...createFoundItemDto,
      image: createFoundItemDto.image ? Buffer.from(createFoundItemDto.image) : null
    });

    console.log('Created Found Item:', createdFoundItem);
    console.log('Image Buffer:', createdFoundItem.image);

    const savedItem = await createdFoundItem.save();
    return this.convertToResponse(savedItem);
  }

  async findAll(): Promise<FoundItemResponse[]> {
    const items = await this.foundItemModel.find().exec();
    return items.map(item => this.convertToResponse(item));
  }

  async findOne(id: string): Promise<FoundItemResponse> {
    const foundItem = await this.foundItemModel.findById(id).exec();
    if (!foundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return this.convertToResponse(foundItem);
  }

  async findByUser(userId: string): Promise<FoundItemResponse[]> {
    const items = await this.foundItemModel.find({ userId }).exec();
    return items.map(item => this.convertToResponse(item));
  }

  async update(id: string, updateFoundItemDto: UpdateFoundItemDto): Promise<FoundItemResponse> {
    const updatedFoundItem = await this.foundItemModel
      .findByIdAndUpdate(id, {
        ...updateFoundItemDto,
        image: updateFoundItemDto.image ? Buffer.from(updateFoundItemDto.image) : undefined
      }, { new: true })
      .exec();
    if (!updatedFoundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return this.convertToResponse(updatedFoundItem);
  }

  async remove(id: string): Promise<FoundItemResponse> {
    const deletedFoundItem = await this.foundItemModel.findByIdAndDelete(id).exec();
    if (!deletedFoundItem) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return this.convertToResponse(deletedFoundItem);
  }

  private convertToResponse(item: FoundItemDocument): FoundItemResponse {
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
