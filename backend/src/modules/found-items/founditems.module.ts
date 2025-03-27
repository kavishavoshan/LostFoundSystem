import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundItem } from './founditems.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoundItem])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class FoundItemModule {} 