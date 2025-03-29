import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, Socket> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(payload.userId, client);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket === client) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const token = client.handshake.auth.token;
      const { userId } = this.jwtService.verify(token);
      
      const message = await this.messagesService.create(payload, userId);
      
      // Send to sender and receiver
      const receiverSocket = this.connectedUsers.get(payload.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('newMessage', message);
      }
      
      client.emit('messageSent', message);
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }
} 