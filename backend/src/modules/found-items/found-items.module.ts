import { Module } from '@nestjs/common';
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