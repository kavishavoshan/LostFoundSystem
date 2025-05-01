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
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard) // Apply the guard to the entire gateway
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

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Authentication should be handled by a Guard (e.g., WsJwtAuthGuard)
      // applied to the gateway or globally.
      // We retrieve the userId added by the guard.
      const userId = client.data?.userId; // Assuming the guard adds userId to client.data

      if (!userId) {
        // Try to extract token from handshake auth data
        const token = client.handshake.auth?.token;
        if (token) {
          try {
            // Verify the token manually if the guard didn't work
            const payload = await this.jwtService.verifyAsync(token);
            if (payload && payload.sub) {
              // Set the userId in client.data
              client.data = client.data || {};
              client.data.userId = payload.sub;
              this.logger.log(`Manually authenticated user ${payload.sub} from token`);
            }
          } catch (jwtError) {
            this.logger.error(`JWT verification failed: ${jwtError.message}`);
          }
        }
      }
      
      // Check again if we have a userId after manual verification
      if (!client.data?.userId) {
        this.logger.error('User ID not found on socket data after connection. Ensure Auth Guard is running.');
        client.disconnect();
        return;
      }

      // Store the mapping between userId and socketId
      this.userSocketMap.set(client.data.userId, client.id);
      this.logger.log(`User ${client.data.userId} connected with socket ${client.id}`);

      // Join a room with the user's ID to receive direct messages
      client.join(client.data.userId);
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
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
    // Emit to all connected clients except sender
    this.server.emit('messageStatus', {
      messageId: data.messageId,
      status: data.status,
      userId: userId
    });
    
    // If the status is 'read', also emit a messageRead event for more specific handling
    if (data.status === 'read') {
      this.server.emit('messageRead', {
        messageId: data.messageId,
        userId: userId,
        readAt: new Date()
      });
    }
  }
  
  @SubscribeMessage('editMessage')
  async handleEditMessage(client: Socket, data: { messageId: string, content: string }) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for edit message event');
      return { error: 'Not authenticated' };
    }
    
    try {
      this.logger.log(`Editing message ${data.messageId} by user ${userId}`);
      
      // Edit the message in the database
      const editedMessage = await this.messagesService.editMessage(
        data.messageId,
        data.content,
        userId
      );
      
      // Broadcast the edited message (ensure it includes all necessary fields, including attachmentUrl if applicable)
      // The service method should return the full updated document
      this.server.to(editedMessage.receiverId.toString()).emit('messageEdited', editedMessage);
      this.server.to(userId).emit('messageEdited', editedMessage);
      
      return { success: true, message: editedMessage };
    } catch (error) {
      this.logger.error(`Error editing message: ${error.message}`);
      return { error: error.message };
    }
  }
  
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(client: Socket, data: { messageId: string }) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for delete message event');
      return { error: 'Not authenticated' };
    }
    
    try {
      this.logger.log(`Deleting message ${data.messageId} by user ${userId}`);
      
      // Get the message to find the recipient before deleting
      const message = await this.messagesService.findOne(data.messageId);
      const recipientId = message.receiverId;
      
      // Delete the message from the database
      await this.messagesService.delete(data.messageId, userId);
      
      // Broadcast the deletion to all relevant clients
      this.server.to(recipientId).emit('messageDeleted', { messageId: data.messageId });
      this.server.to(userId).emit('messageDeleted', { messageId: data.messageId });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    const userId = client.data.userId;
    if (!userId) {
      this.logger.error('User not authenticated for send message event');
      return { error: 'Not authenticated' };
    }
    
    try {
      this.logger.log(`Creating message from ${userId} to ${payload.receiverId}: ${payload.content?.substring(0, 20)}... Attachment: ${payload.attachmentUrl ? 'Yes' : 'No'}`);
      
      // Create the message in the database, ensuring attachmentUrl is passed
      const messageData: CreateMessageDto = {
        content: payload.content,
        receiverId: payload.receiverId,
        attachmentUrl: payload.attachmentUrl, // Explicitly include attachmentUrl
        senderId: userId, // Ensure senderId is set from authenticated user
      };
      
      const message = await this.messagesService.create(messageData, userId);
      
      // Populate sender and receiver info before emitting
      const populatedMessage = await message.populate([
        { path: 'senderId', select: 'firstName lastName email name _id' },
        { path: 'receiverId', select: 'firstName lastName email name _id' }
      ]);
      
      // Emit the new message (including attachmentUrl) to the recipient's room
      this.server.to(payload.receiverId).emit('newMessage', populatedMessage);
      
      // Also emit back to the sender for confirmation
      this.server.to(userId).emit('newMessage', populatedMessage);
      
      this.logger.log(`Message sent successfully: ${message.id}`);
      return { success: true, message: populatedMessage }; // Return populated message
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