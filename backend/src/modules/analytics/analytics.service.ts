import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostItem } from '../lost-items/lostitems.entity';
import { FoundItem } from '../found-items/founditems.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(LostItem)
    private lostItemRepository: Repository<LostItem>,
    @InjectRepository(FoundItem)
    private foundItemRepository: Repository<FoundItem>,
  ) {}

  async getTotalItems() {
    const [totalLost, totalFound] = await Promise.all([
      this.lostItemRepository.count(),
      this.foundItemRepository.count(),
    ]);

    return {
      totalLost,
      totalFound,
      total: totalLost + totalFound,
    };
  }

  async getCommonLostItems() {
    return this.lostItemRepository
      .createQueryBuilder('item')
      .select('item.itemName', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('item.itemName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getFrequentLocations() {
    return this.lostItemRepository
      .createQueryBuilder('item')
      .select('item.lostLocation', 'location')
      .addSelect('COUNT(*)', 'count')
      .groupBy('item.lostLocation')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getReturnRate() {
    const [totalLost, totalFound] = await Promise.all([
      this.lostItemRepository.count(),
      this.foundItemRepository.count(),
    ]);

    const returnRate = totalLost > 0 ? (totalFound / totalLost) * 100 : 0;

    return {
      returnRate: Math.round(returnRate),
      totalLost,
      totalFound,
    };
  }

  async generateReport() {
    const [
      totalItems,
      commonItems,
      frequentLocations,
      returnRate,
    ] = await Promise.all([
      this.getTotalItems(),
      this.getCommonLostItems(),
      this.getFrequentLocations(),
      this.getReturnRate(),
    ]);

    return {
      totalItems,
      commonItems,
      frequentLocations,
      returnRate,
      generatedAt: new Date(),
    };
  }
} 