import {
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AlertsService } from './alerts/alerts.service';
import { TripUpdatesService } from './trip-updates/trip-updates.service';
import { CacheTtlSeconds } from 'src/constants';

@Controller('real-time')
export class RealtimeController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly tripUpdatesService: TripUpdatesService,
  ) {}

  @Get(':feedIndex/alerts')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  findAlerts(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<any> {
    return this.alertsService.getAlerts(feedIndex);
  }

  @Get(':feedIndex/trip-updates/:stationIds')
  @CacheTTL(CacheTtlSeconds.THIRTY_SECONDS)
  findTripUpdates(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Param('stationIds', ParseArrayPipe) stationIds: string[],
  ): Promise<any> {
    return this.tripUpdatesService.getTripUpdates({
      feedIndex,
      stationIds,
    });
  }
}
