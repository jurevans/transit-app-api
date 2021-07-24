import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stops } from 'src/models/entities/stops.entity';
import { StopTimes } from 'src/models/entities/stopTimes.entity';
import { Routes } from 'src/models/entities/routes.entity';
import { Trips } from 'src/models/entities/trips.entity';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
    @InjectRepository(StopTimes)
    private stopTimesRepository: Repository<StopTimes>,
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
  ) {}

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
        'string_agg(routes.route_long_name, \'#\') as "longName"',
        'string_agg(routes.route_url, \'|\') as "routeUrls"',
        'stops.stop_lat as "stopLat"',
        'stops.stop_lon as "stopLon"',
      ])
      .groupBy('stops.stop_lat')
      .addGroupBy('stops.stop_lon')
      .getRawMany();

    return stations.map((station: any) => {
      const routeIds = station.routeIds.split('-');
      const longNames = station.longName.split('#');
      const colors = station.routeColors && station.routeColors.split('-');
      const routeUrls = station.routeUrls.split('|');
      const routes = routeIds.map((routeId: string, i: number) => ({
        routeId,
        longName: longNames[i],
        color: colors ? colors[i] : null,
        url: routeUrls[i],
      }))
        .sort((a, b) => (a.routeId > b.routeId) ? -1 : 1)
        .sort((a, b) => (a.color > b.color) ? 1 : -1);

      return {
        name: station.name.split('#')[0],
        routes,
        coordinates: [
          station.stopLon,
          station.stopLat,
        ],
      }
    });
  }

  findOne(stopId: string) {
    // Do stuff with tripId:
    return this.stopsRepository.findOne({ stopId });
  }
}
