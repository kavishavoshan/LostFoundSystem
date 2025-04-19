import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LostItemsService } from './lost-items.service';
import { LostItemsController } from './lost-items.controller';
import { LostItem, LostItemSchema } from './lost-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LostItem.name, schema: LostItemSchema }
    ])
  ],
  controllers: [LostItemsController],
  providers: [LostItemsService],
  exports: [LostItemsService]
})
export class LostItemsModule {} 