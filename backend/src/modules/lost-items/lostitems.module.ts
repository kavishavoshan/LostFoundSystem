import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LostItem, LostItemSchema } from './lostitems.entity';
import { LostItemsService } from './lost-items.service';
import { LostItemsController } from './lost-items.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: LostItem.name, schema: LostItemSchema }])],
  controllers: [LostItemsController],
  providers: [LostItemsService],
})
export class LostItemsModule {}