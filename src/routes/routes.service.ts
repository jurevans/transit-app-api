import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routes } from 'src/models/entities/routes.entity';
import { getCurrentDay } from 'src/util';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {}

  /**
   * Currently, this gets all routes, all stops for route, and the path.
   * This is broken up into multiple queries, and mapped back together in
   * a usable format.
   * @returns 
   */
  async findAll() {
    const today = getCurrentDay();

    const routes = await this.routesRepository
      .createQueryBuilder('r')
      .select([
        'r.route_id as "routeId"',
        'r.route_short_name as "routeShortName"',
        'r.route_long_name as "routeLongName"',
        'r.route_desc as "routeDesc"',
        'r.route_color as "routeColor"',
      ])
      .distinct(true)
      .innerJoin('r.trips', 'trips')
      .innerJoin('trips.calendar', 'calendar')
      .where(`calendar.${today} = 1`)
      .orderBy('r.route_id', 'ASC')
      .getRawMany();

    return routes;
  }

  async findOne(routeId: string) {
    const today = getCurrentDay();

    const routes = await this.routesRepository
      .createQueryBuilder('r')
      .select([
        'r.route_id as "routeId"',
        'r.route_short_name as "routeShortName"',
        'r.route_long_name as "routeLongName"',
        'r.route_desc as "routeDesc"',
        'r.route_color as "routeColor"',
      ])
      .innerJoin('r.trips', 't')
      .innerJoin('t.calendar', 'cal')
      .where(`cal.${today} = 1`)
      .andWhere('r.route_id = :routeId', { routeId })
      .getRawOne();

    return routes;
  }
}
