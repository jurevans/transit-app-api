import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Repository, IsNull, Not } from 'typeorm';
import { Stops } from 'src/entities/stops.entity';
import { Transfers } from 'src/entities/transfers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';

const STATIONS_PREFIX = 'stations';
const STOPS_PREFIX = 'stops';
const TRANSFERS_PREFIX = 'transfers';

type IndexedStops = {
  [key: string]: string;
};

type IndexedStations = {
  [key: string]: Stops;
}

type IndexedTransfers = {
  [key: string]: string[];
}

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Stops)
    private readonly stopsRepository: Repository<Stops>,
    @InjectRepository(Transfers)
    private readonly transfersRepository: Repository<Transfers>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async getStops(feedIndex: number) {
    const key = `${STOPS_PREFIX}-${feedIndex}`;
    const stopsFromCache = await this.cacheManager.get(key);

    if (stopsFromCache) {
      return stopsFromCache;
    }

    const stops = await this.stopsRepository.find({
      select: ['stopId', 'parentStation'],
      where: {
        feedIndex,
        parentStation: Not(IsNull()),
      },
    });

    const indexedStops: IndexedStops = stops.reduce((indexed: IndexedStops, stop: Stops) => {
      indexed[stop.stopId] = stop.parentStation;
      return indexed;
    }, {});

    await this.cacheManager.set(key, indexedStops, { ttl: 0 });
    return this.cacheManager.get(key);
  }

  public async getStations(feedIndex: number) {
    const key = `${STATIONS_PREFIX}-${feedIndex}`;
    const stationsFromCache = await this.cacheManager.get(key);

    if (stationsFromCache) {
      return stationsFromCache;
    }

    const stations = await this.stopsRepository.find({
      select: ['stopId', 'stopName'],
      where: {
        feedIndex,
        parentStation: IsNull(),
      },
    });

    const indexedStations: IndexedStations = stations.reduce((indexed: IndexedStations, station: Stops) => {
      indexed[station.stopId] = station;
      return indexed;
    }, {});

    await this.cacheManager.set(key, indexedStations, { ttl: 0 });
    return this.cacheManager.get(key);
  }

  public async getTransfers(feedIndex: number) {
    const key = `${TRANSFERS_PREFIX}-${feedIndex}`;
    const transfersFromCache = await this.cacheManager.get(key);

    if (transfersFromCache) {
      return transfersFromCache;
    }

    const transfers = await this.transfersRepository.find({
      select: ['fromStopId', 'toStopId'],
      where: { feedIndex },
    });

    const indexedTransfers: IndexedTransfers = transfers.reduce((indexed: IndexedTransfers, transfer: Transfers) => {
      if (!indexed[transfer.fromStopId]) {
        indexed[transfer.fromStopId] = [];
      }
      indexed[transfer.fromStopId].push(transfer.toStopId);
      return indexed;
    }, {});

    await this.cacheManager.set(key, indexedTransfers, { ttl: 0 });
    return this.cacheManager.get(key);
  }
}
