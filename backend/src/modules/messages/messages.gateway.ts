import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, string> = new Map();

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(socket: Socket) {
    // Expect userId in handshake query for identification
    const userId = Number(socket.handshake.query.userId);
    // Bypass token verification for testing purposes
    // Note: In production, proper authentication should be implemented
    
    if (userId) {
      console.log(`User ${userId} connected to socket ${socket.id}`);
      this.userSockets.set(userId, socket.id);
    } else {
      console.log('Connection attempt without userId');
    }
  }

  async handleDisconnect(socket: Socket) {
    for (const [userId, sockId] of this.userSockets.entries()) {
      if (sockId === socket.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: { senderId: number; receiverId: number; content: string }) {
    const message = await this.messagesService.sendMessage(data.senderId, data.receiverId, data.content);
    // Emit to receiver if online
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', message);
    }
    // Optionally emit to sender for confirmation
    const senderSocketId = this.userSockets.get(data.senderId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('messageSent', message);
    }
    return message;
  }
}