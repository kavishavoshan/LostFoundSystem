import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Define the expected user structure from the JWT payload after validation
interface AuthenticatedUser {
  userId: string;
  // Add other properties from the payload if needed, e.g., email
}

// Extend the Express Request interface
interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('test-data')
  async getTestData() {
    return this.messagesService.getTestData();
  }
  
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${Date.now()}-${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file, @Req() req: RequestWithUser) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Return the URL to the uploaded file
    const url = `http://localhost:3001/uploads/${file.filename}`;
    return { url };
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: RequestWithUser) {
    console.log('[MessagesController] create - req.user:', req.user); // Add logging
    if (!req.user || !req.user.userId) {
      throw new Error('User ID not found in request');
    }
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
    console.log('[MessagesController] delete - req.user:', req.user); // Add logging
    if (!req.user || !req.user.userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.delete(id, req.user.userId);
  }
  
  @Put(':id')
  async editMessage(
    @Param('id') id: string,
    @Body() updateData: { content: string },
    @Req() req: RequestWithUser
  ) {
    console.log('[MessagesController] editMessage - req.user:', req.user); // Add logging
    if (!req.user || !req.user.userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.editMessage(id, updateData.content, req.user.userId);
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
    console.log('[MessagesController] remove - req.user:', req.user); // Add logging
    if (!req.user || !req.user.userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.delete(id, req.user.userId);
  }
}