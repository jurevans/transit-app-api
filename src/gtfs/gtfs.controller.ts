import { Controller, Get, Param, Query } from '@nestjs/common';
import { GtfsService } from './gtfs.service';

@Controller('gtfs')
export class GtfsController {
  constructor(private gtfsService: GtfsService) {}

  /**
   * Test endpoint
   * @param agencyId
   * @returns
   */
  @Get(':feedIndex/all')
  async find(@Param('feedIndex') feedIndex: number) {
    return await this.gtfsService.find({ feedIndex });
  }

  /**
   * Find nearest stations by lon/lat
   * /:feedIndex/location?lat=xxx&lon=xxx
   * @param lon
   * @param lat
   */
  @Get(':feedIndex/location')
  async findByLocation(
    @Param('feedIndex') feedIndex: number,
    @Query('lon') lon: number,
    @Query('lat') lat: number,
  ) {
    return this.gtfsService.findByLocation({ feedIndex, lon, lat });
  }

  /**
   * Find all stations on by routeId (/:feedIndex/stations/:routeId)
   * @param routeId
   */
  @Get(':feedIndex/stationsByRoute/:routeId')
  async findByRouteId(
    @Param('feedIndex') feedIndex: number,
    @Param('routeId') routeId: string,
  ) {
    return await this.gtfsService.findByRouteId({ feedIndex, routeId });
  }

  /**
   * Find all stations provided by comma-delimted list of IDs
   * @param stationIds
   */
  @Get(':feedIndex/stations/:stationIds')
  async findByIds(
    @Param('feedIndex') feedIndex: number,
    @Param('stationIds') stationIdString: string,
  ) {
    return await this.gtfsService.findByIds({ feedIndex, stationIdString });
  }

  /**
   * Find all available routeIds
   */
  @Get(':feedIndex/routes')
  findRouteIds(@Param('feedIndex') feedIndex: number) {
    return this.gtfsService.findRouteIds({ feedIndex });
  }
}
