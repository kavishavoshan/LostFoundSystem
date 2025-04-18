import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('test-data')
  async getTestData() {
    return this.messagesService.getTestData();
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: RequestWithUser) {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  @Get('conversations')
  getConversations(@Query('userId') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  @Get('conversations/:userId')
  getConversation(
    @Param('userId') otherUserId: string,
    @Query('currentUserId') currentUserId: string,
  ) {
    return this.messagesService.getConversation(
      currentUserId,
      otherUserId,
    );
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Query('userId') userId: string) {
    return this.messagesService.markAsRead(id, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.messagesService.delete(id, req.user.userId);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.messagesService.findByUserId(userId);
  }

  @Get('conversations/:userId')
  findConversations(@Param('userId') userId: string) {
    return this.messagesService.findConversationsByUserId(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.messagesService.delete(id, req.user.userId);
  }
} 