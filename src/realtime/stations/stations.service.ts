import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Repository, getManager } from 'typeorm';
import { Stops } from 'entities/stops.entity';
import { Transfers } from 'entities/transfers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { formatCacheKey, getCurrentDay } from 'util/';
import { CacheKeyPrefix, CacheTtlSeconds } from 'constants/';
import { IIndexedStops, ITransfers } from '../interfaces/stations.interface';

type IndexedStops = {
  [key: string]: any;
};

type IndexedTransfers = {
  [key: string]: string[];
};

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Transfers)
    private readonly transfersRepository: Repository<Transfers>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async getStops(feedIndex: number): Promise<IIndexedStops> {
    const key = formatCacheKey(CacheKeyPrefix.STOPS, feedIndex);
    const stopsFromCache: IIndexedStops = await this.cacheManager.get(key);
    const today = getCurrentDay();

    if (stopsFromCache) {
      return stopsFromCache;
    }
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
      INNER JOIN stop_times st
      ON st.stop_id = s.stop_id
      INNER JOIN trips t
      ON t.trip_id = st.trip_id
      INNER JOIN calendar cal
      ON cal.service_id = t.service_id
      WHERE s.feed_index = ${feedIndex}
        AND cal.${today} = 1`);

    const indexedStops: IndexedStops = stops.reduce(
      (indexed: IndexedStops, stop: Stops) => {
        indexed[stop.stopId] = stop;
        return indexed;
      },
      {},
    );

    await this.cacheManager.set(key, indexedStops, {
      ttl: CacheTtlSeconds.ONE_DAY,
    });
    return this.cacheManager.get(key);
  }

  public async getTransfers(feedIndex: number): Promise<ITransfers> {
    const key = `/${CacheKeyPrefix.TRANSFERS}/${feedIndex}`;
    const transfersFromCache: ITransfers = await this.cacheManager.get(key);

    if (transfersFromCache) {
      return transfersFromCache;
    }

    const transfers = await this.transfersRepository.find({
      select: ['fromStopId', 'toStopId'],
      where: { feedIndex },
    });

    const indexedTransfers: IndexedTransfers = transfers.reduce(
      (indexed: IndexedTransfers, transfer: Transfers) => {
        if (!indexed[transfer.fromStopId]) {
          indexed[transfer.fromStopId] = [];
        }
        indexed[transfer.fromStopId].push(transfer.toStopId);
        return indexed;
      },
      {},
    );

    await this.cacheManager.set(key, indexedTransfers, { ttl: 0 });
    return this.cacheManager.get(key);
  }
}
