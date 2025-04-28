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
}
