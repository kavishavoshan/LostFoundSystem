import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../user/user.entity';
import { In } from 'typeorm';

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

  async getTestData() {
    const users = await this.userRepository.find();
    const messages = await this.messageRepository.find({
      relations: ['sender', 'receiver'],
    });

    return {
      users,
      messages,
      userCount: users.length,
      messageCount: messages.length,
    };
  }

  async createTestData() {
    // Check if test users exist
    const existingUser1 = await this.userRepository.findOne({ where: { email: 'user1@test.com' } });
    const existingUser2 = await this.userRepository.findOne({ where: { email: 'user2@test.com' } });

    let user1, user2;

    if (!existingUser1) {
      user1 = this.userRepository.create({
        name: 'John Doe',
        email: 'user1@test.com',
        password: 'password123'  // Will be hashed by @BeforeInsert hook
      });
      user1 = await this.userRepository.save(user1);
    } else {
      user1 = existingUser1;
    }

    if (!existingUser2) {
      user2 = this.userRepository.create({
        name: 'Jane Smith',
        email: 'user2@test.com',
        password: 'password123'  // Will be hashed by @BeforeInsert hook
      });
      user2 = await this.userRepository.save(user2);
    } else {
      user2 = existingUser2;
    }

    // Create test messages if they don't exist
    const existingMessages = await this.messageRepository.find();
    if (existingMessages.length === 0) {
      const messages = [
        {
          content: 'Hi, I found your wallet!',
          sender: user2,
          receiver: user1,
          isRead: false
        },
        {
          content: 'Thank you so much! Where can I pick it up?',
          sender: user1,
          receiver: user2,
          isRead: true
        },
        {
          content: 'I can meet you at the library tomorrow at 2pm',
          sender: user2,
          receiver: user1,
          isRead: false
        }
      ];

      for (const msg of messages) {
        const message = this.messageRepository.create(msg);
        await this.messageRepository.save(message);
      }
    }

    return {
      users: [user1, user2],
      messages: await this.messageRepository.find()
    };
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

  async update(messageId: number, content: string, userId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, sender: { id: userId } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.content = content;
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

  async deleteTestData() {
    // Delete all messages
    await this.messageRepository.delete({});
    
    // Delete test users
    await this.userRepository.delete({ email: In(['user1@test.com', 'user2@test.com']) });
    
    return { message: 'Test data deleted successfully' };
  }
}