import {
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { IRoute } from 'gtfs/interfaces/routes.interface';
import { Routes } from 'entities/routes.entity';
import { Trips } from 'entities/trips.entity';
import { RoutesService } from './routes.service';
import { CacheTtlSeconds } from 'constants/';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_HOUR)
  findAll(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Query('day') day?: string,
  ): Promise<IRoute[]> {
    return this.routesService.findAll({ feedIndex, day });
  }

  @Get(':feedIndex/id/:routeId')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  findOne(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Param('routeId') routeId: string,
    @Query('day') day?: string,
  ): Promise<Routes> {
    return this.routesService.findOne({
      feedIndex,
      routeId,
      day,
    });
  }

  @Get(':feedIndex/trips/:routeId')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  findTrips(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Param('routeId') routeId: string,
    @Query('day') day?: string,
  ): Promise<Trips[]> {
    return this.routesService.findTrips({
      feedIndex,
      routeId,
      day,
    });
  }

  @Get(':feedIndex/id')
  @CacheTTL(CacheTtlSeconds.ONE_HOUR)
  findRouteIds(@Param('feedIndex') feedIndex: number) {
    return this.routesService.findRouteIds({ feedIndex });
  }
}
