import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { LostItem } from '../lost-items/lostitems.entity';
import { FoundItem } from '../found-items/founditems.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostItem, FoundItem])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 