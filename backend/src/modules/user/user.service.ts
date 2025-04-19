import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LostItem, } from '../lost-items/schemas/lost-item.schema';
import { FoundItem, FoundItemDocument } from '../found-items/schemas/found-item.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import * as bcrypt from 'bcrypt';
import { Multer } from 'multer';
import { LostItemDocument } from '../lost-items/lost-item.entity';

@Injectable()
export class UserService {
  uploadProfileImage(userId: string, file: any, arg2: string) {
    throw new Error('Method not implemented.');
  }
  getUserReviews(id: string) {
    throw new Error('Method not implemented.');
  }
  getUserFoundItems(id: string) {
    throw new Error('Method not implemented.');
  }
  getUserLostItems(id: string) {
    throw new Error('Method not implemented.');
  }
  uploadProfileImage(userId: string, file: any, type: string) {
    throw new Error('Method not implemented.');
  }
  getUserReviews(userId: string) {
    throw new Error('Method not implemented.');
  }
  getUserFoundItems(userId: string) {
    throw new Error('Method not implemented.');
  }
  getUserLostItems(userId: string) {
    throw new Error('Method not implemented.');
  }
  remove(userId: string, userId1: string) {
    throw new Error('Method not implemented.');
  }
  update(userId: string, updateUserDto: UpdateUserDto, userId1: string) {
    throw new Error('Method not implemented.');
  }
  findOne(userId: string) {
    throw new Error('Method not implemented.');
  }
  remove(id: string, userId: string) {
    throw new Error('Method not implemented.');
  }
  update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    throw new Error('Method not implemented.');
  }
  findOne(id: string) {
    throw new Error('Method not implemented.');
  }
  findAll() {
    throw new Error('Method not implemented.');
  }
  create(createUserDto: CreateUserDto) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(LostItem.name) private lostItemModel: Model<LostItemDocument>,
    @InjectModel(FoundItem.name) private foundItemModel: Model<FoundItemDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id !== currentUserId) {
      throw new NotFoundException('You can only update your own profile');
    }

    const updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async remove(id: string, currentUserId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id !== currentUserId) {
      throw new NotFoundException('You can only delete your own profile');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }

  async getUserLostItems(userId: string): Promise<LostItemDocument[]> {
    return this.lostItemModel.find({ userId }).exec();
  }

  async getUserFoundItems(userId: string): Promise<FoundItemDocument[]> {
    return this.foundItemModel.find({ userId }).exec();
  }

  async getUserReviews(userId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ userId }).exec();
  }

  async uploadProfileImage(id: string, file: any, type: 'avatar' | 'cover'): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const imageUrl = `/uploads/${file.filename}`;
    const updateData = type === 'avatar' 
      ? { profilePicture: imageUrl }
      : { coverImageUrl: imageUrl };

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }
}
