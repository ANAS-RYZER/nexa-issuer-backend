import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): object {
    return {
      status: 'ok',
      message: 'NEXA Issuer Backend is running',
      timestamp: new Date().toISOString(),
    };
  }
}




