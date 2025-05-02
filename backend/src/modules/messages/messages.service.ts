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
    const messages = await this.messageModel.find().populate('senderId receiverId').exec();

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
          senderId: user1._id,
          receiverId: user2._id,
          isRead: false
        },
        {
          content: 'Thank you so much! Where can I pick it up?',
          senderId: user2._id,
          receiverId: user1._id,
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

  async getConversations(userId: string): Promise<any[]> {
    // Add logging to track the process
    console.log(`Getting conversations for user: ${userId}`);
    
    const messages = await this.messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: -1 })
      .populate('senderId', 'firstName lastName email name _id') // Include _id and name fields
      .populate('receiverId', 'firstName lastName email name _id') // Include _id and name fields
      .exec();

    console.log(`Found ${messages.length} messages for user ${userId}`);
    
    const conversations = {};

    messages.forEach((message) => {
      // Log the message to debug
      console.log(`Processing message: ${message._id}, senderId: ${typeof message.senderId === 'object' ? (message.senderId as any)._id : message.senderId}, receiverId: ${typeof message.receiverId === 'object' ? (message.receiverId as any)._id : message.receiverId}`);
      
      // Ensure senderId and receiverId are populated objects with an _id
      const sender = message.senderId as any;
      const receiver = message.receiverId as any;

      let otherUser: any = null;

      // Check if sender is the current user and receiver exists
      if (sender && typeof sender === 'object' && (sender._id || sender.id) && (sender._id?.toString() === userId || sender.id?.toString() === userId)) {
          otherUser = receiver;
          console.log(`Current user is sender, other user is: ${otherUser?._id || otherUser?.id}`);
      // Check if receiver is the current user and sender exists
      } else if (receiver && typeof receiver === 'object' && (receiver._id || receiver.id) && (receiver._id?.toString() === userId || receiver.id?.toString() === userId)) {
          otherUser = sender;
          console.log(`Current user is receiver, other user is: ${otherUser?._id || otherUser?.id}`);
      }

      // Ensure otherUser is a valid populated object before proceeding
      if (otherUser && typeof otherUser === 'object' && (otherUser._id || otherUser.id)) {
        const otherUserId = (otherUser._id || otherUser.id).toString(); // Use toString() for safety if id is ObjectId

        // If this is the first message seen for this conversation, initialize it
        if (!conversations[otherUserId]) {
          // Get name from either firstName+lastName or name field
          const firstName = otherUser.firstName || '';
          const lastName = otherUser.lastName || '';
          const fullName = otherUser.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Unknown');
          
          console.log(`Creating conversation with user: ${fullName} (${otherUserId})`);
          
          conversations[otherUserId] = {
            // Explicitly structure the otherUser object with needed fields
            otherUser: {
              id: otherUserId,
              _id: otherUserId, // Include both id and _id for compatibility
              firstName: firstName,
              lastName: lastName,
              name: fullName,
              email: otherUser.email || '',
              // Add other fields if needed, e.g., profile picture URL
            },
            lastMessage: message, // This is the latest message so far due to sorting
          };
        }
        // Since messages are sorted descending by createdAt, the first one we encounter
        // for a given otherUserId is the latest message.
      } else {
         // Log if a message couldn't be processed for a conversation
         console.warn(`Could not determine or process other user for message ID: ${message._id}`);
      }
    });
    
    // Log the final result
    console.log(`Returning ${Object.keys(conversations).length} conversations`);
    Object.keys(conversations).forEach(key => {
      console.log(`Conversation with: ${conversations[key].otherUser.firstName} ${conversations[key].otherUser.lastName} (${key})`);
    });


    // Convert the conversations object into an array
    return Object.values(conversations);
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
    message.readAt = new Date();
    return message.save();
  }

  async delete(id: string, userId: string): Promise<MessageDocument | null> {
    // First find the message to validate ownership and time constraints
    const message = await this.messageModel.findOne({ _id: id });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Only allow deletion if the user is the sender
    if (message.senderId.toString() !== userId) {
      throw new Error('You can only delete messages you sent');
    }
    
    // Check if the message is within the 15-minute deletion window
    // Use message._id.getTimestamp() to get the creation time from the ObjectId
    const createdAt = message._id.getTimestamp();
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 15) {
      throw new Error('Messages can only be deleted within 15 minutes of sending');
    }
    
    // Use findByIdAndDelete to ensure the message is properly removed from the database
    const deletedMessage = await this.messageModel.findByIdAndDelete(id).exec();
    if (!deletedMessage) {
      throw new NotFoundException('Message not found or already deleted');
    }
    
    return deletedMessage;
  }
  
  async editMessage(id: string, content: string, userId: string): Promise<MessageDocument> {
    // Find the message and verify ownership
    const message = await this.messageModel.findOne({ _id: id }).exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Verify the user is the sender of the message
    if (message.senderId.toString() !== userId) {
      throw new Error('You can only edit messages you sent');
    }
    
    // Check if the message is within the 15-minute edit window
    // Use message._id.getTimestamp() to get the creation time from the ObjectId
    const createdAt = message._id.getTimestamp();
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 15) {
      throw new Error('Messages can only be edited within 15 minutes of sending');
    }
    
    // Update the message with new content and mark as edited
    message.content = content;
    message.isEdited = true;
    message.editedAt = now;
    
    // Save and return the updated message
    return await message.save();
  }
}