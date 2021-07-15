import { Controller, Get, Param } from '@nestjs/common';
import { StopsService } from './stops.service';
import { Stops } from 'src/models/entities/stops.entity';

@Controller('stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get()
  async findAll(): Promise<Stops[]> {
    return this.stopsService.findAll();
  }

  @Get(':stopId')
  async findOne(@Param('stopId') stopId: string): Promise<Stops> {
    return this.stopsService.findOne(stopId);
  }

}
