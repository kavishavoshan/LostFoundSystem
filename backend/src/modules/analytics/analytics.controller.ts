import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('report')
  async generateReport() {
    return this.analyticsService.generateReport();
  }

  @Get('total-items')
  async getTotalItems() {
    return this.analyticsService.getTotalItems();
  }

  @Get('common-items')
  async getCommonItems() {
    return this.analyticsService.getCommonLostItems();
  }

  @Get('frequent-locations')
  async getFrequentLocations() {
    return this.analyticsService.getFrequentLocations();
  }

  @Get('return-rate')
  async getReturnRate() {
    return this.analyticsService.getReturnRate();
  }
} 