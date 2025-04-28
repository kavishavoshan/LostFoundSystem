import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
    if (!sender || !receiver) throw new Error('Sender or receiver not found');
    const message = this.messageRepository.create({ sender, receiver, content });
    return this.messageRepository.save(message);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    message.read = true;
    return this.messageRepository.save(message);
  }

  async editMessage(messageId: number, content: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    
    // Check if message is less than 15 minutes old
    const messageTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    if ((currentTime - messageTime) > fifteenMinutes) {
      throw new Error('Messages can only be edited within 15 minutes of sending');
    }
    
    message.content = content;
    message.isEdited = true;
    return this.messageRepository.save(message);
  }

  async deleteMessage(messageId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    
    // Check if message is less than 15 minutes old
    const messageTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    if ((currentTime - messageTime) > fifteenMinutes) {
      throw new Error('Messages can only be deleted within 15 minutes of sending');
    }
    
    message.isDeleted = true;
    message.content = 'This message was deleted';
    return this.messageRepository.save(message);
  }

  async uploadImage(senderId: number, receiverId: number, imageUrl: string): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
    if (!sender || !receiver) throw new Error('Sender or receiver not found');
    const message = this.messageRepository.create({ 
      sender, 
      receiver, 
      content: 'Image', 
      imageUrl 
    });
    return this.messageRepository.save(message);
  }

  async getUnreadMessages(userId: number): Promise<Message[]> {
    return this.messageRepository.find({ where: { receiver: { id: userId }, read: false } });
  }
}