import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trips } from 'src/models/entities/trips.entity';
import { Calendar } from 'src/models/entities/calendar.entity';
import { Shapes } from 'src/models/entities/shapes.entity';

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
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = daysOfWeek[new Date().getDay()];
    /*
    const availableServices = await (await this.calendarRepository.find({ select: ['serviceId'], where: { [today] : 1 } }));
    const availableServiceIds = availableServices.map(service => service.serviceId);
    */
    const trips = await this.tripsRepository
      .createQueryBuilder('trips')
      .innerJoin('trips.calendar', 'calendar')
      .innerJoinAndSelect('trips.routes', 'routes')
      .innerJoinAndSelect('trips.stopTimes', 'stopTimes')
      /*
      .leftJoinAndMapMany(
        'trips.shapes',
        qb => qb.from(Shapes, 'shapes'),
        'shape',
        'shape.shape_id = trips.shape_id'
      )
      */
      .innerJoinAndSelect('routes.agency', 'agency')
      .where(`calendar.${today} = 1`)
      .andWhere('routes.route_id = :routeId', { routeId })
      .andWhere('stopTimes.stop_sequence = 1')
      .limit(10)
      .getMany();

    return trips;
  }

  findForService(serviceId: string) {
    return this.tripsRepository.find({ where: { serviceId }, relations: ['routes', 'calendar'] });
  }
}
