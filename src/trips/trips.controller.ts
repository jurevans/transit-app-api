import { Controller, Get, Param } from '@nestjs/common';
import { TripsService } from './trips.service';
import { Trips } from 'src/models/entities/trips.entity';

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get(':serviceId')
  async findForService(@Param('serviceId') serviceId: string): Promise<Trips[]> {
    const trips = await this.tripsService.findForService(serviceId);
    return trips;
  }
}
