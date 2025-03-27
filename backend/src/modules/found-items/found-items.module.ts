import { Module } from '@nestjs/common';
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