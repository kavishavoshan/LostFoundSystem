import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostItem } from './lostitems.entity';
import { LostItemService } from './lost-items.service';
import { LostItemController } from './lost-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LostItem])],
  controllers: [LostItemController],
  providers: [LostItemService],
})
export class LostItemModule {}