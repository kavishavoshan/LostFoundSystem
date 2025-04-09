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
}