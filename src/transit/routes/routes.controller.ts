import { CacheTTL, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { RouteRawData } from 'src/interfaces/data';
import { Routes } from 'src/entities/routes.entity';
import { Trips } from 'src/entities/trips.entity';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get(':feedIndex')
  @CacheTTL(3600)
  findAll(
    @Param('feedIndex') feedIndex: number,
    @Query('day') day?: string,
  ): Promise<RouteRawData> {
    return this.routesService.findAll({ feedIndex, day });
  }

  @Get(':feedIndex/id/:routeId')
  @CacheTTL(60)
  async findOne(
      @Param('feedIndex') feedIndex: number,
      @Param('routeId') routeId: string,
      @Query('day') day?: string,
    ): Promise<Routes> {
    const routes = await this.routesService.findOne({ feedIndex, routeId, day });
    if (!routes) {
      throw new NotFoundException();
    }
    return routes;
  }

  @Get(':feedIndex/trips/:routeId')
  @CacheTTL(60)
  async findTrips(
      @Param('feedIndex') feedIndex: number,
      @Param('routeId') routeId: string,
      @Query('day') day?: string,
    ): Promise<Trips[]> {
    const trips = await this.routesService.findTrips({ feedIndex, routeId, day });
    if (!trips) {
      throw new NotFoundException();
    }
    return trips;
  }

  @Get(':feedIndex/id')
  @CacheTTL(3600)
  findRouteIds(@Param('feedIndex') feedIndex: number) {
    return this.routesService.findRouteIds({ feedIndex });
  }
}
