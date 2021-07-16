import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trips } from 'src/models/entities/trips.entity';
import { Calendar } from 'src/models/entities/calendar.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
  ) {}

  async findAvailableTrips(routeId: string) {
    const daysOfWeek = [
      'sundary',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = daysOfWeek[ new Date().getDay() ];
    /*
    const availableServices = await (await this.calendarRepository.find({ select: ['serviceId'], where: { [today] : 1 } }));
    const availableServiceIds = availableServices.map(service => service.serviceId);
    */
    const trips = await this.tripsRepository
      .createQueryBuilder('trips')
      .innerJoinAndSelect('trips.calendar', 'calendar')
      .innerJoinAndSelect('trips.routes', 'routes')
      .innerJoinAndSelect('routes.agency', 'agency')
      .where(`calendar.${today} = 1`)
      .andWhere('routes.route_id = :routeId', { routeId })
      .limit(10)
      .getMany();

    return trips;
  }

  findForService(serviceId: string) {
    return this.tripsRepository.find({ where: { serviceId }, relations: ['routes', 'calendar'] });
  }
}
