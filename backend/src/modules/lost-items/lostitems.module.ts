import { Module } from '@nestjs/common';
<<<<<<< HEAD
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
=======
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
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
