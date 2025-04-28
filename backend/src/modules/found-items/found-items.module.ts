import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundItem } from './found-items.entity';
import { FoundItemService } from './found-items.service';
import { FoundItemController } from './found-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FoundItem])],
  controllers: [FoundItemController],
  providers: [FoundItemService],
})
export class FoundItemModule {}
=======
import { MongooseModule } from '@nestjs/mongoose';
import { FoundItemsService } from './found-items.service';
import { FoundItemsController } from './found-items.controller';
import { FoundItem, FoundItemSchema } from './found-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FoundItem.name, schema: FoundItemSchema }
    ])
  ],
  controllers: [FoundItemsController],
  providers: [FoundItemsService],
  exports: [FoundItemsService]
})
export class FoundItemsModule {}
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
