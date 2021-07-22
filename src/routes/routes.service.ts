import { Injectable } from '@nestjs/common';
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
            'stopTimes.arrival_time as "arrivalTime"',
            'stopTimes.departure_time as "departureTime"',
            'stopTimes.stop_id as stopTimes_stopId',
            'stops.stop_name as "stopName"',
            'stops.stop_lon as "stopLon"',
            'stops.stop_lat as "stopLat"',
            // Unnecessary, but interesting, as we're using PostGIS:
            /*
            'ST_X(stops.the_geom) as "theGeomX"',
            'ST_Y(stops.the_geom) as "theGeomY"',
            'ST_AsText(stops.the_geom) as "theGeomText"',
            */
          ])
          .getRawMany();

        // Get shape data from here first:
        // https://data.cityofnewyork.us/api/geospatial/3qz8-muuu?method=export&format=GeoJSON
        const shapes = await this.shapesRepository
          .createQueryBuilder('shapes')
          .where('shapes.shape_id = :shapeId', { shapeId: trip.shapeId })
          .orderBy('shapes.shape_pt_sequence', 'ASC')
          .getMany();

        tripData = {
          ...trip,
          stops,
          path: shapes.map(shape => ([shape.shapePtLon, shape.shapePtLat])),
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
    const today = daysOfWeek[new Date().getDay()];

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

  async findStations() {
    const routes = await this.routesRepository.find({
      select: [
        'routeId',
        'routeShortName',
        'routeLongName',
        'routeDesc',
        'routeColor',
      ],
    });

    const mapTrips = routes.map(async (route: Routes) => {
      const trip = await this.tripsRepository.findOne({
        where: {
          routeId: route.routeId,
          directionId: 1,
        },
        select: [ 'tripId', 'shapeId', 'tripHeadsign', 'directionId' ],
      });

      return {
        ...route,
        trip,
      };
    });

    const tripIds = await Promise.all(mapTrips.map(async (trip: any) => {
      const thing = await trip;
      if (thing && thing.trip) {
        return thing.trip.tripId;
      }
    }));

    const inTripIds = tripIds.filter((id: string) => !!id);

    const stations = await this.stopTimesRepository
      .createQueryBuilder('stop_times')
      .innerJoinAndSelect('stop_times.stops', 'stops')
      .innerJoinAndSelect('stop_times.trips', 'trips')
      .innerJoinAndSelect('trips.routes', 'routes')
      .andWhere('stop_times.trip_id IN (:...tripIds)', { tripIds: inTripIds })
      .select([
        'string_agg(routes.route_short_name, \'-\') as "routeIds"',
        'string_agg(routes.route_color, \'-\') as "routeColors"',
        'string_agg(stops.stop_name, \'#\') as "name"',
        'string_agg(routes.route_long_name, \'#\') as "longname"',
        'stops.stop_lat as "stopLat"',
        'stops.stop_lon as "stopLon"',
      ])
      .groupBy('stops.stop_lat')
      .addGroupBy('stops.stop_lon')
      .getRawMany();

    return stations.map((station: any) => {
      const routeIds = station.routeIds.split('-');
      const longNames = station.longname.split('#');
      return {
        line: routeIds.sort().join('-'),
        name: station.name.split('#')[0],
        longname: longNames.map((longName: string, i: number) => `${routeIds[i]} - ${longName}`).join(', '),
        colors: station.routeColors,
        coordinates: [
          station.stopLon,
          station.stopLat,
        ],
      }
    }).sort((a, b) => (a.line < b.line) ? -1 : 1);
  }
}
