import { Injectable } from '@nestjs/common';
import { Repository, IsNull, Not } from 'typeorm';
// import * as GTFS from 'proto/gtfs-realtime';
import { Stops } from 'src/entities/stops.entity';
import { Transfers } from 'src/entities/transfers.entity';
import { InjectRepository } from '@nestjs/typeorm';

type IndexedStops = {
  [key: string]: string,
};

type IndexedStations = {
  [key: string]: Stops,
};

@Injectable()
export class RealtimeService {
  private _stations: IndexedStations;
  private _stops: Stops[];
  private _transfers: Transfers[];
  private _indexedStops: IndexedStops;

  constructor(
    @InjectRepository(Stops)
    private readonly stopsRepository: Repository<Stops>,
    @InjectRepository(Transfers)
    private readonly transfersRepository: Repository<Transfers>,
  ) {}

  private async indexStops(feedIndex: number) {
    if (!this._stations && !this._indexedStops) {
      this._stations = {};
      this._indexedStops = {};

      const stations = await this.stopsRepository.find({
        select: ['stopId', 'stopName'],
        where: {
          feedIndex,
          parentStation: IsNull(),
        },
      });
  
      const stops = await this.stopsRepository.find({
        select: ['stopId', 'parentStation'],
        where: {
          feedIndex,
          parentStation: Not(IsNull()),
        },
      });

      this._stops = stops;
      stops.forEach((stop: Stops) => {
        this._indexedStops[stop.stopId] = stop.parentStation;
      });

      stations.forEach((station: Stops) => {
        this._stations[station.stopId] = station;
      });
    }
  }

  public async findByStationId(props: { feedIndex: number, stationId: string }) {
    const { feedIndex, stationId } = props;
    await this.indexStops(feedIndex);
    const stops = this._stops.filter((stop: Stops) => stop.parentStation === stationId);
    return {
      station: this._stations[stationId],
      stops,
    };
  }
}
