import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Req, Headers, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import 'multer'; // Add import for multer types

@Controller('messages')
// Removed the global JWT guard to allow access without authentication
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('content') content: string,
    @Req() req: any
  ) {
    // Use senderId from request body if available, otherwise try to get from JWT token
    const actualSenderId = senderId || (req.user ? req.user.id : null);
    if (!actualSenderId) {
      throw new Error('Sender ID is required');
    }
    return this.messagesService.sendMessage(actualSenderId, receiverId, content);
  }

  @Get('conversation/:userId')
  async getMessagesBetweenUsers(@Req() req: any, @Param('userId') userId: number) {
    // Use currentUserId from JWT token if available, otherwise check localStorage via query param
    const currentUserId = req.user ? req.user.id : req.query.currentUserId;
    if (!currentUserId) {
      throw new Error('Current user ID is required');
    }
    return this.messagesService.getMessagesBetweenUsers(Number(currentUserId), Number(userId));
  }

  @Patch('read/:messageId')
  async markAsRead(@Param('messageId') messageId: number) {
    return this.messagesService.markAsRead(messageId);
  }

  @Get('unread')
  async getUnreadMessages(@Req() req: any) {
    // Use userId from JWT token if available, otherwise check query param
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.messagesService.getUnreadMessages(Number(userId));
  }

  @Patch(':messageId/edit')
  async editMessage(
    @Param('messageId') messageId: number,
    @Body('content') content: string,
  ) {
    return this.messagesService.editMessage(messageId, content);
  }

  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: number) {
    return this.messagesService.deleteMessage(messageId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In a real implementation, you would upload the file to a storage service
    // and get back a URL to store in the database
    const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
    return this.messagesService.uploadImage(senderId, receiverId, imageUrl);
  }
}