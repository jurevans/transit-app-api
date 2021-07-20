import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stops } from 'src/models/entities/stops.entity';
import { StopTimes } from 'src/models/entities/stopTimes.entity';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
    @InjectRepository(StopTimes)
    private stopTimesRepository: Repository<StopTimes>,
  ) {}

  findAll() {
    // return this.stopsRepository.find();
    // Query Builder example - This returns only requested columns

    /*
    return this.stopsRepository
      .createQueryBuilder('stops')
      .select(['stop_id as "stopId"', 'the_geom as "theGeom"'])
      .getRawMany();
    */

      return this.stopsRepository
        .createQueryBuilder('stops')
        .innerJoinAndSelect('stops.stopTimes', 'stopTimes')
        .innerJoinAndSelect('stopTimes.trips', 'trips')
        .innerJoinAndSelect('trips.routes', 'routes')
        .distinct(true)
        .select([
          // 'string_add(routes.route_id, \'-\')'
          'routes.route_id as routeId',
          'stops.stop_lon as stopLon',
          'stops.stop_lat as stopLat',
          'stops.stop_name as stopName',
        ])
        .orderBy('routeId')
        .getRawMany();
  }

  findOne(stopId: string) {
    // Do stuff with tripId:
    return this.stopsRepository.findOne({ stopId });
  }
}
