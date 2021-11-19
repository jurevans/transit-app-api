import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Stops } from 'entities/stops.entity';
import { IParentStation } from '../interfaces/stops.interface';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
  ) {}

  async findStops(props: { feedIndex: number }): Promise<IParentStation[]> {
    const { feedIndex } = props;

    const manager = getManager();
    const stops = await manager.query(`
      SELECT
        DISTINCT ON (s.stop_id) s.stop_id AS "stopId",
        s.parent_station AS "parentStation",
        t.trip_headsign AS "headsign",
        t.trip_id AS "tripId",
        t.route_id AS "routeId",
        t.direction_id AS "directionId",
        EXTRACT(epoch FROM st.arrival_time) AS "time"
      FROM stops s
      INNER JOIN
      stop_times st
      ON st.stop_id = s.stop_id
      LEFT JOIN
      trips t
      ON t.trip_id = st.trip_id
      WHERE s.feed_index = ${feedIndex}`);

    const parentStations = await this.stopsRepository
      .createQueryBuilder('s')
      .select([
        's.stop_id AS "stopId"',
        's.stop_name AS "name"',
        's.stop_lat AS "latitude"',
        's.stop_lon AS "longitude"',
      ])
      .where('s.feed_index = :feedIndex', { feedIndex })
      .andWhere('s.parent_station IS NULL')
      .getRawMany();

    parentStations.forEach((station: any) => {
      station.stops = {};
      const stopsForStation = stops.filter(
        (stop: any) => stop.parentStation === station.stopId,
      );
      stopsForStation.forEach((stop: any) => {
        station.stops[stop.stopId] = stop;
      });
    });

    return parentStations;
  }

  async findTransfers(props: { feedIndex }) {
    const { feedIndex } = props;

    const manager = getManager();
    const transfers = await manager.query(`
      SELECT
        t.from_stop_id AS "stationId",
        t.to_stop_id AS "stopId",
        t.min_transfer_time AS "time"
      FROM stops s
      INNER JOIN transfers t
      ON t.from_stop_id = s.stop_id
      WHERE s.feed_index = ${feedIndex}
    `);

    return transfers.reduce((obj: any, transfer: any) => {
      const { stationId, stopId, time } = transfer;
      const stopObj = { stopId, time };
      if (!obj[stationId]) {
        obj[stationId] = [stopObj];
        return obj;
      }
      obj[stationId].push(stopObj);
      return obj;
    }, {});
  }
}
