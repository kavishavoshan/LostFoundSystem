import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { LostItem, LostItemSchema } from '../lost-items/lostitems.entity';
import { FoundItem, FoundItemSchema } from '../found-items/found-items.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LostItem.name, schema: LostItemSchema },
      { name: FoundItem.name, schema: FoundItemSchema }
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 