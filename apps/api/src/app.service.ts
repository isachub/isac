import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): object {
    return {
      status: 'ok',
      service: 'ISAC API',
      timestamp: new Date().toISOString(),
    };
  }
}
