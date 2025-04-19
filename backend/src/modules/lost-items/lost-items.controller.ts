<<<<<<< HEAD
import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { LostItemService } from './lost-items.service';
import { CreateLostItemDto } from './dto/lostitems.create-lost-items';
import { UpdateLostItemDto } from './dto/lostitems.update-lost-items';

@Controller('lost-items')
export class LostItemController {
  constructor(private readonly lostItemService: LostItemService) { }

  @Post('createLostItem')
  create(@Body() createLostItemDto: CreateLostItemDto) {
    return this.lostItemService.create(createLostItemDto);
  }

  @Get('getAllLostItems')
  findAll() {
    return this.lostItemService.findAll();
  }

  @Get('getLostItem/:id')
  findOne(@Param('id') id: number) {
    return this.lostItemService.findOne(id);
  }

  @Put('updateLostItem/:id')
  update(@Param('id') id: number, @Body() updateLostItemDto: UpdateLostItemDto) {
    return this.lostItemService.update(id, updateLostItemDto);
  }

  @Delete('deleteLostItem/:id')
  remove(@Param('id') id: number) {
    return this.lostItemService.remove(id);
  }
=======
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
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
}
