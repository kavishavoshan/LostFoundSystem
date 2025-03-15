import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { LostItemService } from './lost-items.service';
import { CreateLostItemDto } from './dto/lostitems.create-lost-items';

@Controller('lost-items')
export class LostItemController {
  constructor(private readonly lostItemService: LostItemService) {}

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
}
