import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsPageController } from './news-page.controller';
import { NewsPageService } from './news-page.service';
import { NewsPage } from './news-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsPage])],
  controllers: [NewsPageController],
  providers: [NewsPageService],
})
export class NewsPageModule {}