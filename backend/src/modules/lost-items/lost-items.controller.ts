import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { LostItemsService } from './lost-items.service';
import { CreateLostItemDto } from './dto/create-lost-item.dto';
import { UpdateLostItemDto } from './dto/update-lost-item.dto';
import { LostItemResponse } from './types/lost-item.types';

@Controller('lost-items')
export class LostItemsController {
  constructor(private readonly lostItemsService: LostItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createLostItemDto: CreateLostItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
        ],
        fileIsRequired: false, // Optional for lost items
      }),
    ) image?: Express.Multer.File,
  ): Promise<LostItemResponse> {
    try {
      if (image) {
        createLostItemDto.image = image.buffer;
        createLostItemDto.imageContentType = image.mimetype;
      }
      return await this.lostItemsService.create(createLostItemDto);
    } catch (error) {
      throw new BadRequestException('Failed to create lost item: ' + error.message);
    }
  }

  @Get()
  findAll(): Promise<LostItemResponse[]> {
    return this.lostItemsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<LostItemResponse[]> {
    return this.lostItemsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<LostItemResponse> {
    return this.lostItemsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateLostItemDto: UpdateLostItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
        ],
        fileIsRequired: false,
      }),
    ) image?: Express.Multer.File,
  ): Promise<LostItemResponse> {
    try {
      if (image) {
        updateLostItemDto.image = image.buffer;
        updateLostItemDto.imageContentType = image.mimetype;
      }
      return await this.lostItemsService.update(id, updateLostItemDto);
    } catch (error) {
      throw new BadRequestException('Failed to update lost item: ' + error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lostItemsService.remove(id);
  }
}
