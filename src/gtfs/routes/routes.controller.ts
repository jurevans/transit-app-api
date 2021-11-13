import {
  CacheTTL,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { IRoutes } from 'src/gtfs/interfaces/routes';
import { Routes } from 'src/entities/routes.entity';
import { Trips } from 'src/entities/trips.entity';
import { RoutesService } from './routes.service';
import { CacheTtlSeconds } from 'src/constants';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_HOUR)
  findAll(
    @Param('feedIndex') feedIndex: number,
    @Query('day') day?: string,
  ): Promise<IRoutes> {
    return this.routesService.findAll({ feedIndex, day });
  }

  @Get(':feedIndex/id/:routeId')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  async findOne(
    @Param('feedIndex') feedIndex: number,
    @Param('routeId') routeId: string,
    @Query('day') day?: string,
  ): Promise<Routes> {
    const routes = await this.routesService.findOne({
      feedIndex,
      routeId,
      day,
    });
    if (!routes) {
      throw new NotFoundException();
    }
    return routes;
  }

  @Get(':feedIndex/trips/:routeId')
  @CacheTTL(CacheTtlSeconds.ONE_MINUTE)
  async findTrips(
    @Param('feedIndex') feedIndex: number,
    @Param('routeId') routeId: string,
    @Query('day') day?: string,
  ): Promise<Trips[]> {
    const trips = await this.routesService.findTrips({
      feedIndex,
      routeId,
      day,
    });
    if (!trips) {
      throw new NotFoundException();
    }
    return trips;
  }

  @Get(':feedIndex/id')
  @CacheTTL(CacheTtlSeconds.ONE_HOUR)
  findRouteIds(@Param('feedIndex') feedIndex: number) {
    return this.routesService.findRouteIds({ feedIndex });
  }
}
