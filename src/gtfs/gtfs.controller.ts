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
  @Get('all/:feedIndex')
  async find(@Param('feedIndex') feedIndex: number) {
    return await this.gtfsService.find({ feedIndex });
  }

  /**
   * Find nearest stations by lon/lat
   * /location/:feedIndex?lat=xxx&lon=xxx
   * @param lon
   * @param lat
   */
  @Get('location/:feedIndex')
  async findByLocation(
    @Param('feedIndex') feedIndex: number,
    @Query('lon') lon: string,
    @Query('lat') lat: string,
  ) {

  }

  /**
   * Find all stations on by routeId (/:feedIndex/:routeId)
   * @param routeId
   */
  @Get('routeId/:feedIndex/:routeId')
  async findByRouteId(
      @Param('feedIndex') feedIndex: number,
      @Param('routeId') routeId: string,
    ) {

  }

  /**
   * Find all stations provided by comma-delimted list of IDs
   * @param stationIds
   */
  @Get('station/:feedIndex/:stationIds')
  async findById(
    @Param('feedIndex') feedIndex: number,
      @Param('stationIds') stationIds: string,
    ) {

  }

  /**
   * Find all available routeIds
   */
  @Get('routes/:feedIndex')
  findRouteIds(@Param('feedIndex') feedIndex: number) {
    return this.gtfsService.findRouteIds({ feedIndex });
  }
}
