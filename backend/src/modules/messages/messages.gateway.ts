import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(MessagesGateway.name);
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.error('No token provided, disconnecting client');
        client.disconnect();
        return;
      }
      
      // Verify and decode the token
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId || decoded.sub;
      
      if (!userId) {
        this.logger.error('Invalid token payload, disconnecting client');
        client.disconnect();
        return;
      }
      
      // Store the mapping between userId and socketId
      this.userSocketMap.set(userId, client.id);
      client.data.userId = userId; // Store userId in socket data for easy access
      
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      // Join a room with the user's ID to receive direct messages
      client.join(userId);
    } catch (error) {
      this.logger.error(`Socket authentication failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove the user from the mapping when they disconnect
    if (client.data.userId) {
      this.userSocketMap.delete(client.data.userId);
      this.logger.log(`User ${client.data.userId} disconnected`);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { recipientId: string, isTyping: boolean }) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for typing event');
      return;
    }
    
    this.logger.log(`User ${userId} typing status to ${data.recipientId}: ${data.isTyping}`);
    // Emit to the recipient's room
    this.server.to(data.recipientId).emit('typing', {
      senderId: userId,
      isTyping: data.isTyping
    });
  }

  @SubscribeMessage('messageStatus')
  handleMessageStatus(client: Socket, data: { messageId: string, status: 'delivered' | 'read' }) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for message status event');
      return;
    }
    
    this.logger.log(`Message ${data.messageId} status updated to ${data.status}`);
    // Broadcast to all connected clients except sender
    client.broadcast.emit('messageStatus', {
      messageId: data.messageId,
      status: data.status,
      userId: userId
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for send message event');
      return { error: 'Not authenticated' };
    }
    
    try {
      this.logger.log(`Creating message from ${userId} to ${payload.receiverId}: ${payload.content.substring(0, 20)}...`);
      
      // Create the message in the database
      const message = await this.messagesService.create({
        ...payload,
        senderId: userId, // Ensure senderId is set from authenticated user
      }, userId);
      
      // Emit the new message to the recipient's room
      this.server.to(payload.receiverId).emit('newMessage', message);
      
      // Also emit back to the sender for confirmation
      this.server.to(userId).emit('newMessage', message);
      
      this.logger.log(`Message sent successfully: ${message.id}`);
      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { userId: string }) {
    const authenticatedUserId = client.data.userId;
    
    // Security check: only allow joining your own room
    if (!authenticatedUserId || authenticatedUserId !== data.userId) {
      this.logger.error(`Unauthorized attempt to join room: ${data.userId} by user: ${authenticatedUserId}`);
      return { error: 'Unauthorized' };
    }
    
    this.logger.log(`User ${authenticatedUserId} joining their room`);
    client.join(data.userId);
    return { success: true };
  }
}