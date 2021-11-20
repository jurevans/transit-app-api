import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { DateTime } from 'luxon';
import { StationsService } from 'realtime/stations/stations.service';
import { FeedService } from 'realtime/feed/feed.service';
import { FeedEntity } from 'realtime/proto/gtfs-realtime';
import {
  IIndexedStop,
  IIndexedStops,
} from 'realtime/interfaces/stations.interface';
import {
  IStopTimeUpdate,
  ITrip,
} from 'realtime/interfaces/trip-updates.interface';
import { IEndpoint } from 'realtime/interfaces/trip-updates.interface';
import { CacheKeyPrefix, CacheTtlSeconds, MAX_MINUTES } from 'constants/';
import { getConfigByFeedIndex } from 'util/';
import { FeedMessage } from 'realtime/proto/gtfs-realtime';

@Injectable()
export class TripUpdatesService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly stationsService: StationsService,
    private readonly feedService: FeedService,
    private readonly configService: ConfigService,
  ) {}

  private _getRouteUrls(feedUrls: IEndpoint[], routeIds: string[]) {
    return feedUrls
      .filter((endpoint: IEndpoint) => {
        if (routeIds.length > 0 && endpoint.hasOwnProperty('routes')) {
          return endpoint.routes.some(
            (route: string) => routeIds.indexOf(route) > -1,
          );
        }
        return true;
      })
      .map((endpoint: IEndpoint) => endpoint.url);
  }

  private async _getFeedMessage(props: {
    feedIndex: number;
    routeIds?: string[];
  }) {
    const { feedIndex, routeIds = [] } = props;
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );
    const { feedUrls } = config;
    // Which of these URLs should I use?
    const urls = this._getRouteUrls(feedUrls, routeIds);

    return Promise.all(
      urls.map(async (endpoint: string) => {
        // Check Redis for cached response:
        const feedMessageInCache = await this.cacheManager.get(endpoint);
        if (feedMessageInCache) {
          return feedMessageInCache;
        }

        const feedMessage = await this.feedService.getFeed({
          feedIndex,
          endpoint,
        });
        await this.cacheManager.set(endpoint, feedMessage, {
          ttl: CacheTtlSeconds.THIRTY_SECONDS,
        });
        return await this.cacheManager.get(endpoint);
      }),
    );
  }

  private _getTripUpdateEntities(feedMessage: FeedMessage) {
    return feedMessage.entity.filter((entity: FeedEntity) =>
      entity.hasOwnProperty('tripUpdate'),
    );
  }

  private static _collectRouteIds(stopTimeUpdates: IStopTimeUpdate[]) {
    const routeIds: string[] = [];
    /* TODO: Fix "any" */
    stopTimeUpdates.forEach((update: ITrip | any) => {
      const { routeId } = update;
      if (routeIds.indexOf(routeId) < 0) {
        routeIds.push(routeId);
      }
    });
    return routeIds.sort();
  }

  private async _getStopTimeUpdates(props: {
    feedIndex: number;
    entities: FeedEntity[];
    stopIds: string[];
  }): Promise<IStopTimeUpdate[]> {
    const { feedIndex, entities, stopIds } = props;
    // TODO: We need to pull the timezone from the Agency table:
    const now = DateTime.now().toSeconds();
    const vehicles = [];
    const key = `/${CacheKeyPrefix.VEHICLES}/${stopIds.join(',')}`;
    const vehiclesInCache: IStopTimeUpdate[] = await this.cacheManager.get(key);

    if (vehiclesInCache) {
      return vehiclesInCache;
    }

    const indexedStops = await this.stationsService.getStops(feedIndex);

    entities.forEach((entity: FeedEntity) => {
      const { stopTimeUpdate, trip } = entity.tripUpdate;
      const { routeId, tripId } = trip;
      stopTimeUpdate.forEach((update: IStopTimeUpdate) => {
        if (!update.arrival) {
          return;
        }
        const { stopId, arrival } = update;
        const { time, delay } = arrival;
        if (
          stopIds.indexOf(update.stopId) > -1 &&
          time > now &&
          time < now + MAX_MINUTES * 60
        ) {
          const { headsign } = indexedStops[stopId];
          vehicles.push({
            stopId,
            time,
            delay,
            routeId,
            tripId,
            headsign,
          });
        }
      });
    });

    vehicles.sort((a: IIndexedStop, b: IIndexedStop) =>
      a.time < b.time ? -1 : 1,
    );
    await this.cacheManager.set(key, vehicles, {
      ttl: CacheTtlSeconds.THIRTY_SECONDS,
    });
    return await this.cacheManager.get(key);
  }

  public async getTripUpdates(props: {
    feedIndex: number;
    stationIds: string[];
  }) {
    const { feedIndex, stationIds = [] } = props;

    const allStops: IIndexedStops = await this.stationsService.getStops(
      feedIndex,
    );
    const stops = stationIds.reduce(
      (stops: IIndexedStop[], stationId: string) => {
        stops = [
          ...stops,
          ...Object.keys(allStops)
            .filter((key: string) => allStops[key].parentStation === stationId)
            .map((key: string) => allStops[key]),
        ];
        return stops;
      },
      [],
    );

    const stopIds = stops.map((stop: IIndexedStop) => stop.stopId);

    const routeIds = stops.reduce((routeIds: string[], stop: IIndexedStop) => {
      const { routeId } = stop;
      if (routeIds.indexOf(routeId) < 0) {
        routeIds.push(routeId);
      }
      return routeIds;
    }, []);

    const feedMessages = await this._getFeedMessage({
      feedIndex,
      routeIds,
    });

    /* TODO: Fix "any" */
    const entities: any = feedMessages.reduce(
      (entities: FeedEntity[], feedMessage: FeedMessage) => {
        const tripUpdates = this._getTripUpdateEntities(feedMessage);
        if (tripUpdates.length > 0) {
          entities = [...entities, ...tripUpdates];
          return entities;
        }
      },
      [],
    );

    const stopTimeUpdates: IStopTimeUpdate[] = await this._getStopTimeUpdates({
      feedIndex,
      entities,
      stopIds,
    });

    const routeIdsFromStops =
      TripUpdatesService._collectRouteIds(stopTimeUpdates);
    return {
      routeIds: routeIdsFromStops,
      stopTimeUpdates,
    };
  }
}
