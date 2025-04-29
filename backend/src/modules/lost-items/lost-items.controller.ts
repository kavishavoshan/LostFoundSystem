import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'; // Import Express
import { LostItemsService } from './lost-items.service';
import { CreateLostItemDto } from './dto/create-lost-item.dto';
import { UpdateLostItemDto } from './dto/update-lost-item.dto';

@Controller('lost-items')
export class LostItemsController {
  constructor(private readonly lostItemsService: LostItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // Handle image upload (optional for lost items for now)
  create(
    @Body() createLostItemDto: CreateLostItemDto,
    @UploadedFile() image?: Express.Multer.File // Use the imported Express namespace
  ) {
    // Pass DTO and optional image to service (Service needs update)
    return this.lostItemsService.create(createLostItemDto);
  }

  @Get()
  findAll() {
    return this.lostItemsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.lostItemsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lostItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLostItemDto: UpdateLostItemDto) {
    return this.lostItemsService.update(id, updateLostItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lostItemsService.remove(id);
}
}
