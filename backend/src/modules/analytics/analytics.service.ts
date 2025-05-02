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
    const [lostCount, foundCount, commonItems, frequentLocs] = await Promise.all([
      this.getLostItemsCount(),
      this.getFoundItemsCount(),
      this.getCommonLostItems(), // Fetch common items
      this.getFrequentLocationsInternal(), // Fetch frequent locations (internal format)
    ]);

    // Calculate return rate - using the formula from getReturnRate for consistency if needed, or keep the current one.
    // Let's use the one that seems more logical: percentage of total items that were found.
    const calculatedReturnRate = (lostCount + foundCount) > 0 ? (foundCount / (lostCount + foundCount)) * 100 : 0;

    const totalItems = {
      total: lostCount + foundCount,
      totalLost: lostCount,
      totalFound: foundCount,
    };

    // Map frequent locations from { name, count } to { location, count }
    const frequentLocationsFormatted = frequentLocs.map(loc => ({
      location: loc.name, // Rename 'name' to 'location'
      count: loc.count,
    }));

    return {
      totalItems: totalItems, // Nested object as expected by frontend
      commonItems: commonItems, // Renamed from commonLostItems
      frequentLocations: frequentLocationsFormatted, // Use formatted locations with 'location' key
      returnRate: {
        returnRate: parseFloat(calculatedReturnRate.toFixed(2)), // Nested object as expected by frontend
      },
      generatedAt: new Date(), // Add generation timestamp
    };
  }

  async getTotalItems(): Promise<number> {
    const [lostCount, foundCount] = await Promise.all([
      this.getLostItemsCount(),
      this.getFoundItemsCount(),
    ]);
    return lostCount + foundCount;
  }

  async getCommonLostItems(): Promise<{ name: string; count: number }[]> {
    return this.lostItemModel.aggregate([
      // Ensure itemType exists before grouping
      { $match: { itemType: { $exists: true, $ne: null } } }, // Removed duplicate $ne: '' 
      { $group: { _id: '$itemType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      // Project to match frontend { name, count } structure
      { $project: { _id: 0, name: '$_id', count: 1 } } 
    ]).exec();
  }

  async getFrequentLocationsInternal(): Promise<{ name: string; count: number }[]> {
    const [lostLocations, foundLocations] = await Promise.all([
      this.getLostItemsByLocation(),
      this.getFoundItemsByLocation(),
    ]);

    const locationMap = new Map<string, number>();

    // Helper to add to map, handling null/undefined locations
    const addToMap = (loc: any) => {
      if (loc && loc._id) { // Check if _id exists and is not null/undefined
        const currentCount = locationMap.get(loc._id) || 0;
        locationMap.set(loc._id, currentCount + loc.count);
      }
    };

    lostLocations.forEach(addToMap);
    foundLocations.forEach(addToMap);

    return Array.from(locationMap.entries())
      // Map to { name, count } structure for internal use
      .map(([name, count]) => ({ name, count })) 
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Add the missing public method
  async getFrequentLocations(): Promise<{ location: string; count: number }[]> {
    const frequentLocs = await this.getFrequentLocationsInternal();
    // Map frequent locations from { name, count } to { location, count }
    return frequentLocs.map(loc => ({
      location: loc.name, // Rename 'name' to 'location'
      count: loc.count,
    }));
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

  async getLostItemsByLocation(): Promise<{ _id: string; count: number }[]> {
    return this.lostItemModel.aggregate([
      // Ensure lostLocation exists before grouping
      { $match: { lostLocation: { $exists: true, $ne: null } } }, // Removed duplicate $ne: '' 
      { $group: { _id: '$lostLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
  }

  async getFoundItemsByLocation(): Promise<{ _id: string; count: number }[]> {
    return this.foundItemModel.aggregate([
      // Ensure foundLocation exists before grouping
      { $match: { foundLocation: { $exists: true, $ne: null } } }, // Removed duplicate $ne: '' 
      { $group: { _id: '$foundLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
  }
}