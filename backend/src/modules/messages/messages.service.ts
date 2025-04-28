import { Injectable } from '@nestjs/common';
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
    if (!message) throw new Error('Message not found');
    message.read = true;
    return this.messageRepository.save(message);
  }

  async getUnreadMessages(userId: number): Promise<Message[]> {
    return this.messageRepository.find({ where: { receiver: { id: userId }, read: false } });
  }
}