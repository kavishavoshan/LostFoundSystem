import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { FoundItemsService } from './found-items.service';
import { FoundItemsController } from './found-items.controller';
import { FoundItem, FoundItemSchema } from './found-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FoundItem.name, schema: FoundItemSchema }
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    })
  ],
  controllers: [FoundItemsController],
  providers: [FoundItemsService],
  exports: [FoundItemsService]
})
export class FoundItemsModule {}