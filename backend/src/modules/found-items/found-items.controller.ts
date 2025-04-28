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
}