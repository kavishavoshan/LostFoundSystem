import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('test-data')
  async getTestData() {
    return this.messagesService.getTestData();
  }

  @Put(':id')

  async updateMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('userId') userId: string,
  ) {
    return this.messagesService.update(parseInt(id), content, parseInt(userId));
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto, createMessageDto.senderId);
  }

  @Get('conversations')
  getConversations(@Query('userId') userId: string) {
    return this.messagesService.getConversations(parseInt(userId));
  }

  @Get('conversations/:userId')
  getConversation(
    @Param('userId') otherUserId: string,
    @Query('currentUserId') currentUserId: string,
  ) {
    return this.messagesService.getConversation(
      parseInt(currentUserId),
      parseInt(otherUserId),
    );
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Query('userId') userId: string) {
    return this.messagesService.markAsRead(parseInt(id), parseInt(userId));
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Query('userId') userId: string) {
    return this.messagesService.delete(parseInt(id), parseInt(userId));
  }

  @Delete('test-data')
  async deleteTestData() {
    return this.messagesService.deleteTestData();
  }
}