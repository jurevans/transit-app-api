import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Routes } from 'src/models/entities/routes.entity';
import { Trips } from 'src/models/entities/trips.entity';
import { StopTimes } from 'src/models/entities/stopTimes.entity';
import { Shapes } from 'src/models/entities/shapes.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
    @InjectRepository(StopTimes)
    private stopTimesRepository: Repository<StopTimes>,
    @InjectRepository(Shapes)
    private shapesRepository: Repository<Shapes>,
  ) {}

  /**
   * Currently, this gets all routes, all stops for route, and the path.
   * This is broken up into multiple queries, and mapped back together in
   * a usable format.
   * @returns 
   */
  async findAll() {
    const routes = await this.routesRepository.find({
      select: [
        'routeId',
        'routeShortName',
        'routeLongName',
        'routeDesc',
        'routeColor',
      ],
    });

    const mapStationsAndPath = routes.map(async (route: Routes) => {
      const trip = await this.tripsRepository.findOne({
        where: {
          routeId: route.routeId,
          shapeId: Not(IsNull()),
        },
        select: [ 'tripId', 'shapeId', 'tripHeadsign', 'directionId' ],
      });

      let tripData = null;

      if (trip) {
        const { tripId } = trip;
        const stops = await this.stopTimesRepository
          .createQueryBuilder('stopTimes')
          .where('trip_id = :tripId', { tripId })
          .orderBy('stopTimes.stop_sequence')
          .innerJoinAndSelect('stopTimes.stops', 'stops')
          .select([
            'stops.stop_name as "stopName"',
            'stops.stop_lon as "stopLon"',
            'stops.stop_lat as "stopLat"',
          ])
          .getRawMany();

        const shapes = await this.shapesRepository
          .createQueryBuilder('shapes')
          .where('shapes.shape_id = :shapeId', { shapeId: trip.shapeId })
          .orderBy('shapes.shape_pt_sequence', 'ASC')
          .getMany();

        tripData = {
          ...trip,
          path: shapes.map(shape => ([ shape.shapePtLon, shape.shapePtLat ])),
          stops,
        }
      }
      const routeWithStations = {
        ...route,
        trip: tripData,
      };
      return routeWithStations;
    });

    return await Promise.all(mapStationsAndPath);
  }

  async findOne(routeId: string) {
    const daysOfWeek = [
      'sunday',
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
      // .innerJoinAndSelect('trips.stopTimes', 'stopTimes')
      .where(`calendar.${today} = 1`)
      .andWhere('routes.route_id = :routeId', { routeId })
      .getOne();

    return routes;
  }
}
