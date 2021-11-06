import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getIndex(): string {
    return JSON.stringify({
      name: 'GTFS API',
      url: 'https://github.com/jurevans/transit-app-api/',
    });
  }
}
