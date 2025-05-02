import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  searchUsers(@Query('query') query: string) {
    return this.userService.searchUsers(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.userService.update(id, updateUserDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.userService.remove(id, req.user.userId);
  }

  @Get('me')
  getCurrentUser(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.userId);
  }

  @Patch('me')
  updateCurrentUser(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.userId, updateUserDto, req.user.userId);
  }

  @Delete('me')
  deleteCurrentUser(@Req() req: RequestWithUser) {
    return this.userService.remove(req.user.userId, req.user.userId);
  }

  @Get('me/lost-items')
  getCurrentUserLostItems(@Req() req: RequestWithUser) {
    return this.userService.getUserLostItems(req.user.userId);
  }

  @Get('me/found-items')
  getCurrentUserFoundItems(@Req() req: RequestWithUser) {
    return this.userService.getUserFoundItems(req.user.userId);
  }

  @Get('me/reviews')
  getCurrentUserReviews(@Req() req: RequestWithUser) {
    return this.userService.getUserReviews(req.user.userId);
  }

  @Post('upload/:type')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: any,
    @Param('type') type: 'avatar' | 'cover',
    @Req() req: RequestWithUser,
  ) {
    return this.userService.uploadProfileImage(req.user.userId, file, type);
  }

  @Get(':id/lost-items')
  getUserLostItems(@Param('id') id: string) {
    return this.userService.getUserLostItems(id);
  }

  @Get(':id/found-items')
  getUserFoundItems(@Param('id') id: string) {
    return this.userService.getUserFoundItems(id);
  }

  @Get(':id/reviews')
  getUserReviews(@Param('id') id: string) {
    return this.userService.getUserReviews(id);
  }

  @Post('upload-profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileImage(@UploadedFile() file: any, @Req() req: RequestWithUser) {
    return this.userService.uploadProfileImage(req.user.userId, file, 'avatar');
  }
}
