import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { LostItemsService } from './lost-items.service';
import { LostItemsController } from './lost-items.controller';
import { LostItem, LostItemSchema } from './lost-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LostItem.name, schema: LostItemSchema }
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    })
  ],
  controllers: [LostItemsController],
  providers: [LostItemsService],
  exports: [LostItemsService]
})
export class LostItemsModule {}