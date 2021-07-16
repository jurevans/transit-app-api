import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routes } from 'src/models/entities/routes.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {}

  findAll() {
    return this.routesRepository.find({ relations: ['agency'] })
  }

  async findOne(routeId: string) {
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

    const routes = await this.routesRepository
      .createQueryBuilder('routes')
      .innerJoinAndSelect('routes.trips', 'trips')
      .innerJoinAndSelect('trips.calendar', 'calendar')
      .innerJoinAndSelect('trips.stopTimes', 'stopTimes')
      .where(`calendar.${today} = 1`)
      .andWhere('routes.route_id = :routeId', { routeId })
      .limit(10)
      .getOne();

    return routes; //this.routesRepository.findOne({ routeId });
  }
}
