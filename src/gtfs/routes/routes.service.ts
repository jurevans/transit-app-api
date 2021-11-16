import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routes } from 'src/entities/routes.entity';
import { Trips } from 'src/entities/trips.entity';
import { getCurrentDay } from 'src/util';
import { IRoute } from 'src/gtfs/interfaces/routes.interface';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
  ) {}

  async findAll(props: { feedIndex: number; day?: string }): Promise<IRoute[]> {
    const { feedIndex, day } = props;
    const today = day || getCurrentDay();
    const routes = await this.routesRepository
      .createQueryBuilder('r')
      .select([
        'r.route_id as "routeId"',
        'r.route_short_name as "routeShortName"',
        'r.route_long_name as "routeLongName"',
        'r.route_desc as "routeDesc"',
        'r.route_color as "routeColor"',
        'r.route_url as "routeUrl"',
      ])
      .distinct(true)
      .innerJoin('r.trips', 't')
      .innerJoin('t.calendar', 'cal')
      .where(`cal.${today} = 1`)
      .andWhere('r.feed_index = :feedIndex', { feedIndex })
      .orderBy('r.route_id', 'ASC')
      .getRawMany();

    return routes;
  }

  async findOne(params: {
    feedIndex: number;
    routeId: string;
    day?: string;
  }): Promise<Routes> {
    const { feedIndex, routeId, day } = params;
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
      .andWhere('r.feed_index = :feedIndex', { feedIndex })
      .getRawOne();

    return routes;
  }

  async findTrips(props: { feedIndex: number; routeId: string; day: string }) {
    const { feedIndex, routeId, day } = props;
    const today = day || getCurrentDay();

    const trips = await this.tripsRepository
      .createQueryBuilder('t')
      .innerJoin('t.calendar', 'cal')
      .where(`cal.${today} = 1`)
      .andWhere('t.route_id = :routeId', { routeId })
      .andWhere('t.feed_index = :feedIndex', { feedIndex })
      .getMany();

    return trips;
  }

  async findRouteIds(props: { feedIndex: number }): Promise<any> {
    const { feedIndex } = props;
    const routeIdsResults = await this.routesRepository.find({
      select: ['routeId'],
      where: { feedIndex },
    });
    return routeIdsResults.map((routeIdResult: any) => routeIdResult.routeId);
  }
}
