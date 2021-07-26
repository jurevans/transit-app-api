import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { StopsService } from './stops.service';
import { Stops } from 'src/models/entities/stops.entity';

@Controller('stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get()
  async findAll(
    @Query('day') day?: string,
    @Query('geojson') geojson?: string,
    ): Promise<any[]> {
    return this.stopsService.findAll({ day, geojson });
  }

  @Get(':stopId')
  async findOne(@Param('stopId') stopId: string): Promise<Stops> {
    const stop = await this.stopsService.findOne(stopId);
    if (!stop) {
      throw new NotFoundException();
    }
    return stop;
  }
}
