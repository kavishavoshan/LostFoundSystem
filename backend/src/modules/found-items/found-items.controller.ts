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
import { FoundItemsService } from './found-items.service';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto';
import { FoundItemResponse } from './types/found-item.types';

@Controller('found-items')
export class FoundItemsController {
  constructor(private readonly foundItemsService: FoundItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createFoundItemDto: CreateFoundItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
        ],
        fileIsRequired: false,
      }),
    ) image?: Express.Multer.File,
  ): Promise<FoundItemResponse> {
    try {
      if (image) {
        createFoundItemDto.image = image.buffer;
        createFoundItemDto.imageContentType = image.mimetype;
      }

      return await this.foundItemsService.create(createFoundItemDto);
    } catch (error) {
      throw new BadRequestException('Failed to create found item: ' + error.message);
    }
  }

  @Get()
  findAll(): Promise<FoundItemResponse[]> {
    return this.foundItemsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<FoundItemResponse[]> {
    return this.foundItemsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<FoundItemResponse> {
    return this.foundItemsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateFoundItemDto: UpdateFoundItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif)' }),
        ],
        fileIsRequired: false,
      }),
    ) image?: Express.Multer.File,
  ): Promise<FoundItemResponse> {
    try {
      if (image) {
        updateFoundItemDto.image = image.buffer;
        updateFoundItemDto.imageContentType = image.mimetype;
      }
      return await this.foundItemsService.update(id, updateFoundItemDto);
    } catch (error) {
      throw new BadRequestException('Failed to update found item: ' + error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foundItemsService.remove(id);
  }
}