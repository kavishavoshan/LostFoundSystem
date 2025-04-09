import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LostItem, LostItemDocument } from '../lost-items/lostitems.entity';
import { FoundItem, FoundItemDocument } from '../found-items/found-items.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(LostItem.name) private lostItemModel: Model<LostItemDocument>,
    @InjectModel(FoundItem.name) private foundItemModel: Model<FoundItemDocument>,
  ) {}

  async generateReport(): Promise<any> {
    const [lostCount, foundCount, lostByLocation, foundByLocation] = await Promise.all([
      this.getLostItemsCount(),
      this.getFoundItemsCount(),
      this.getLostItemsByLocation(),
      this.getFoundItemsByLocation(),
    ]);

    return {
      totalLost: lostCount,
      totalFound: foundCount,
      lostByLocation,
      foundByLocation,
      returnRate: foundCount > 0 ? (foundCount / (lostCount + foundCount)) * 100 : 0,
    };
  }

  async getTotalItems(): Promise<number> {
    const [lostCount, foundCount] = await Promise.all([
      this.getLostItemsCount(),
      this.getFoundItemsCount(),
    ]);
    return lostCount + foundCount;
  }

  async getCommonLostItems(): Promise<any[]> {
    return this.lostItemModel.aggregate([
      { $group: { _id: '$itemType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).exec();
  }

  async getFrequentLocations(): Promise<any[]> {
    const [lostLocations, foundLocations] = await Promise.all([
      this.getLostItemsByLocation(),
      this.getFoundItemsByLocation(),
    ]);

    const locationMap = new Map();
    
    lostLocations.forEach(({ _id, count }) => {
      locationMap.set(_id, (locationMap.get(_id) || 0) + count);
    });
    
    foundLocations.forEach(({ _id, count }) => {
      locationMap.set(_id, (locationMap.get(_id) || 0) + count);
    });

    return Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  async getReturnRate(): Promise<number> {
    const [lostCount, foundCount] = await Promise.all([
      this.getLostItemsCount(),
      this.getFoundItemsCount(),
    ]);
    return lostCount > 0 ? (foundCount / lostCount) * 100 : 0;
  }

  async getLostItemsCount(): Promise<number> {
    return this.lostItemModel.countDocuments().exec();
  }

  async getFoundItemsCount(): Promise<number> {
    return this.foundItemModel.countDocuments().exec();
  }

  async getLostItemsByLocation(): Promise<any[]> {
    return this.lostItemModel.aggregate([
      { $group: { _id: '$lostLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
  }

  async getFoundItemsByLocation(): Promise<any[]> {
    return this.foundItemModel.aggregate([
      { $group: { _id: '$foundLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
  }
} 