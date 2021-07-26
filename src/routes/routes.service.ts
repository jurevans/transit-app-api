import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routes } from 'src/models/entities/routes.entity';
import { getCurrentDay } from 'src/util';
import { RouteRawData } from 'src/interfaces/data';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {}

  async findAll(params: { day?: string }): Promise<RouteRawData> {
    const { day } = params;
    const today = day || getCurrentDay();
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
      .innerJoin('trips.calendar', 'cal')
      .where(`cal.${today} = 1`)
      .orderBy('r.route_id', 'ASC')
      .getRawMany();

    return routes;
  }

  async findOne(params: { routeId: string, day?: string }): Promise<Routes> {
    const { routeId, day } = params;
    const today = day || getCurrentDay();

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
