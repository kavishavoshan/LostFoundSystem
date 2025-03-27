import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { FoundItemService } from './found-items.service';
import { CreateFoundItemDto } from './dto/founditems.create-found-items';

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
}