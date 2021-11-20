import {
  CacheTTL,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AlertsService } from 'realtime/alerts/alerts.service';
import { TripUpdatesService } from 'realtime/trip-updates/trip-updates.service';
import { RealtimeService } from 'realtime/realtime.service';
import { Alert } from 'realtime/proto/gtfs-realtime';
import { AlertEntity } from 'realtime/entities/AlertEntity';
import { CacheTtlSeconds } from 'constants/';

@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly tripUpdatesService: TripUpdatesService,
    private readonly realtimeService: RealtimeService,
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

  /* New endpoints in development: */
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':feedIndex/alerts-test')
  @CacheTTL(1) // TODO: Change Me
  async findAlertsTest(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<AlertEntity[]> {
    const alerts = await this.realtimeService.getAlerts(feedIndex);

    return alerts.map((alert: Alert) => new AlertEntity(alert));
  }

  @Get(':feedIndex/trip-updates-test')
  @CacheTTL(1) // TODO: Change Me
  findTripUpdatesTest(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Query('routeIds', new DefaultValuePipe([]), ParseArrayPipe)
    routeIds: string[],
  ): Promise<any> {
    return this.realtimeService.getTripUpdates({
      feedIndex,
      routeIds,
    });
  }
}
