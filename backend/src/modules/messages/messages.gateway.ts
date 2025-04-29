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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { recipientId: string, isTyping: boolean }) {
    this.server.to(data.recipientId).emit('typing', {
      senderId: client.id,
      isTyping: data.isTyping
    });
  }

  @SubscribeMessage('messageStatus')
  handleMessageStatus(client: Socket, data: { messageId: string, status: 'delivered' | 'read' }) {
    this.server.to(data.messageId).emit('messageStatus', {
      messageId: data.messageId,
      status: data.status
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: CreateMessageDto & { receiverId: string }) {
    const message = await this.messagesService.create(payload, client.id);
    client.to(String(payload.receiverId)).emit('message', message);
    return message;
  }
}