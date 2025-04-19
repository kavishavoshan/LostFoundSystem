<<<<<<< HEAD
import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { FoundItemService } from './found-items.service';
import { CreateFoundItemDto } from './dto/founditems.create-found-items';
import { UpdateFoundItemDto } from './dto/founditems.update-found-item';

@Controller('found-items')
export class FoundItemController {
  constructor(private readonly foundItemService: FoundItemService) {}

  @Post('createFoundItem')
  create(@Body() createFoundItemDto: CreateFoundItemDto) {
    return this.foundItemService.create(createFoundItemDto);
  }

  @Get('getAllFoundItems')
  findAll() {
    return this.foundItemService.findAll();
  }

  @Get('getFoundItem/:id')
  findOne(@Param('id') id: number) {
    return this.foundItemService.findOne(id);
  }

    @Put('updateFoundItem/:id')
    update(@Param('id') id: number, @Body() updateLostItemDto: UpdateFoundItemDto) {
      return this.foundItemService.update(id, updateLostItemDto);
    }
  
    @Delete('deleteLostItem/:id')
    remove(@Param('id') id: number) {
      return this.foundItemService.remove(id);
    }
=======
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FoundItemsService } from './found-items.service';
import { CreateFoundItemDto } from './dto/create-found-item.dto';
import { UpdateFoundItemDto } from './dto/update-found-item.dto'

@Controller('found-items')
export class FoundItemsController {
  constructor(private readonly foundItemsService: FoundItemsService) {}

  @Post()
  create(@Body() createFoundItemDto: CreateFoundItemDto) {
    return this.foundItemsService.create(createFoundItemDto);
  }

  @Get()
  findAll() {
    return this.foundItemsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.foundItemsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foundItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoundItemDto: UpdateFoundItemDto) {
    return this.foundItemsService.update(id, updateFoundItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foundItemsService.remove(id);
  }

    // @Put('updateFoundItem/:id')
    // update(@Param('id') id: number, @Body() updateLostItemDto: UpdateFoundItemDto) {
    //   return this.foundItemService.update(id, updateLostItemDto);
    // }
  
    // @Delete('deleteLostItem/:id')
    // remove(@Param('id') id: number) {
    //   return this.foundItemService.remove(id);
    // }
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
}