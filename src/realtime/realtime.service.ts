import { Injectable } from '@nestjs/common';
import { Repository, IsNull, Not } from 'typeorm';
// import * as GTFS from 'proto/gtfs-realtime';
import { Stops } from 'src/entities/stops.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RealtimeService {
  private _stops: Stops[] = [];

  constructor(
    @InjectRepository(Stops)
    private readonly stopsRepository: Repository<Stops>,
  ) {}

  private async indexStops(feedIndex: number) {
    if (!(this._stops.length > 0)) {
      const stops = await this.stopsRepository.find({
        select: ['stopId', 'parentStation'],
        where: {
          feedIndex,
          parentStation: Not(IsNull()),
        },
      });

      this._stops = stops;
    }
  }

  public async findByStationId(props: { feedIndex: number, stationIds: string[] }) {
    const { feedIndex, stationIds } = props;
    await this.indexStops(feedIndex);

    return stationIds.map((stationId: string) => ({
      stationId,
      stops: this._stops.filter((stop: Stops) => stop.parentStation === stationId).map((stop: Stops) => stop.stopId),
    }));
  }
}
