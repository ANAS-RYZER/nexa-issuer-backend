import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRateService } from '../exchange-rate.service';

@Injectable()
export class ExchangeRateCron {
  constructor(private readonly service: ExchangeRateService) {}

  // every 60 minutes
  @Cron('*/60 * * * *')
  async handleCron() {
    await this.service.fetchRates();
    console.log('Cron: Exchange rates refreshed');
  }
}
