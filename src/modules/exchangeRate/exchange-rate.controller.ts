import { Controller, Get } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly service: ExchangeRateService) {}

  @Get()
  async getRates() {
    await this.service.fetchRates();

    return {
      success: true,
      data: this.service.getRates(),
    };
  }
}
