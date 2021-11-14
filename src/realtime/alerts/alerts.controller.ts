import { CacheTTL, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CacheTtlSeconds } from 'src/constants';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  async find(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<any> {
    return await this.alertsService.getAlerts(feedIndex);
  }
}
