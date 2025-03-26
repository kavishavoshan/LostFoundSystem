import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../user/user.entity';

@Injectable()
export class MessagesService implements OnModuleInit {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createTestData();
  }

  private async createTestData() {
    // Create test users if they don't exist
    let user1 = await this.userRepository.findOne({ where: { email: 'user1@test.com' } });
    let user2 = await this.userRepository.findOne({ where: { email: 'user2@test.com' } });

    if (!user1) {
      const newUser1 = this.userRepository.create({
        email: 'user1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        password: 'password123'
      });
      user1 = await this.userRepository.save(newUser1);
    }

    if (!user2) {
      const newUser2 = this.userRepository.create({
        email: 'user2@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        password: 'password123'
      });
      user2 = await this.userRepository.save(newUser2);
    }

    // Create test messages if none exist
    const messageCount = await this.messageRepository.count();
    if (messageCount === 0) {
      const message1 = this.messageRepository.create({
        content: 'Hello! I found your wallet.',
        sender: user1,
        receiver: user2,
        isRead: false
      });

      const message2 = this.messageRepository.create({
        content: 'Thank you so much! Where can I pick it up?',
        sender: user2,
        receiver: user1,
        isRead: false
      });

      await this.messageRepository.save([message1, message2]);
    }
  }

  async create(createMessageDto: CreateMessageDto, senderId: number): Promise<Message> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: createMessageDto.receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const message = this.messageRepository.create({
      content: createMessageDto.content,
      sender,
      receiver,
    });

    return this.messageRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getConversations(userId: number): Promise<{ otherUser: User; lastMessage: Message }[]> {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } },
      ],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    const conversations = new Map<number, { otherUser: User; lastMessage: Message }>();

    for (const message of messages) {
      const otherUser = message.sender.id === userId ? message.receiver : message.sender;
      if (!conversations.has(otherUser.id)) {
        conversations.set(otherUser.id, { otherUser, lastMessage: message });
      }
    }

    return Array.from(conversations.values());
  }

  async markAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, receiver: { id: userId } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    return this.messageRepository.save(message);
  }

  async delete(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, sender: { id: userId } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.messageRepository.remove(message);
  }
} 