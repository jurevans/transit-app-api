import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { StopsService } from './stops.service';
import { Stops } from 'src/models/entities/stops.entity';

@Controller('stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get()
  async findAll(): Promise<any[]> {
    return this.stopsService.findAll();
  }

  @Get(':stopId')
  async findOne(@Param('stopId') stopId: string): Promise<Stops> {
    const stops = await this.stopsService.findOne(stopId);
    if (!stops) {
      throw new NotFoundException();
    }
    return stops;
  }
}
