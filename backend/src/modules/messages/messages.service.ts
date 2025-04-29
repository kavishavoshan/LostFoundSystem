import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class MessagesService implements OnModuleInit {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async onModuleInit() {
    await this.createTestData();
  }

  async getTestData() {
    const users = await this.userModel.find().exec();
    const messages = await this.messageModel.find().populate('sender receiver').exec();

    return {
      users,
      messages,
      userCount: users.length,
      messageCount: messages.length,
    };
  }

  private async createTestData() {
    // Create test users if they don't exist
    let user1 = await this.userModel.findOne({ email: 'user1@test.com' });
    let user2 = await this.userModel.findOne({ email: 'user2@test.com' });

    if (!user1) {
      user1 = await this.userModel.create({
        email: 'user1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        password: 'password123'
      });
    }

    if (!user2) {
      user2 = await this.userModel.create({
        email: 'user2@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        password: 'password123'
      });
    }

    // Create test messages if none exist
    const messageCount = await this.messageModel.countDocuments();
    if (messageCount === 0) {
      await this.messageModel.create([
        {
          content: 'Hello! I found your wallet.',
          sender: user1._id,
          receiver: user2._id,
          isRead: false
        },
        {
          content: 'Thank you so much! Where can I pick it up?',
          sender: user2._id,
          receiver: user1._id,
          isRead: false
        }
      ]);
    }
  }

  async create(createMessageDto: CreateMessageDto, userId: string): Promise<MessageDocument> {
    const createdMessage = new this.messageModel({
      ...createMessageDto,
      senderId: userId,
    });
    return createdMessage.save();
  }

  async findByUserId(userId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).exec();
  }

  async findConversationsByUserId(userId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
    .sort({ createdAt: -1 })
    .exec();
  }

  async findAll(): Promise<MessageDocument[]> {
    return this.messageModel.find().populate('senderId receiverId').exec();
  }

  async findOne(id: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(id).populate('senderId receiverId').exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async getConversations(userId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: -1 })
      .populate('senderId receiverId')
      .exec();
  }

  async getConversation(userId: string, otherUserId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .populate('senderId receiverId')
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<MessageDocument> {
    const message = await this.messageModel.findOne({
      _id: id,
      receiverId: userId,
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    return message.save();
  }

  async delete(id: string, userId: string): Promise<MessageDocument | null> {
    const message = await this.messageModel.findOne({ _id: id, $or: [{ senderId: userId }, { receiverId: userId }] });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    const deletedMessage = await this.messageModel.findByIdAndDelete(id).exec();
    if (!deletedMessage) {
      throw new NotFoundException('Message not found');
    }
    return deletedMessage;
  }
} 