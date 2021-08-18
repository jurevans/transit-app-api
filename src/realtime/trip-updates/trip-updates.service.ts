import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { DateTime } from 'luxon';
import { StationsService } from '../stations.service';
import { CacheKeyPrefix, CacheTtlSeconds } from 'src/constants';
import { FeedService } from '../feed/feed.service';

const MAX_MINUTES = 60;

@Injectable()
export class TripUpdatesService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly stationsService: StationsService,
    private readonly http: HttpService,
    private readonly feedService: FeedService,
  ) {}

  private _getRouteUrls(feedUrls: any[], routeIds: string[]) {
    return feedUrls
      .filter((endpoint: any) => {
        if (routeIds.length > 0
            && endpoint.hasOwnProperty('routes')) {
          return endpoint.routes.some((route: string) => routeIds.indexOf(route) > -1);
        }
        return true;
      })
      .map((endpoint: any) => {
        if (endpoint.hasOwnProperty('url')) {
          return endpoint.url;
        }
        return endpoint;
      });
  }

  private async _getFeedMessage(props: {
    feedIndex: number,
    routeIds?: string[],
  }) {
    const { feedIndex, routeIds = [] } = props;
    const { feedUrls } = this.feedService.getConfig(feedIndex);
    // Which of these URLs should I use?
    const urls = this._getRouteUrls(feedUrls, routeIds);

    // Add the following fetches to a queue instead?
    return Promise.all(urls.map(async (endpoint: string) => {
      // Check Redis for cached response:
      const feedMessageInCache = await this.cacheManager.get(endpoint);
      if (feedMessageInCache) {
        return feedMessageInCache;
      }

      const feedMessage = await this.feedService.getFeed({ feedIndex, endpoint });
      await this.cacheManager.set(endpoint, feedMessage, { ttl: CacheTtlSeconds.THIRTY_SECONDS })
      return await this.cacheManager.get(endpoint);
    }));
  }

  private _getTripUpdateEntities(feedMessage: any) {
    return feedMessage.entity.filter((entity: any) => entity.hasOwnProperty('tripUpdate'));
  }

  private static _collectRouteIds(stopTimeUpdates: any) {
    const routeIds = [];
    stopTimeUpdates.forEach((update: any) => {
      const { routeId } = update;
      if (routeIds.indexOf(routeId) < 0) {
        routeIds.push(routeId);
      }
    });
    return routeIds.sort();
  }

  private async _getStopTimeUpdates(props: {
    feedIndex: number,
    entities: any[],
    stopIds: string[],
  }) {
    const { feedIndex, entities, stopIds } = props;
    // TODO: We need to pull the timezone from Agency:
    const now = DateTime.now().toSeconds();
    const vehicles = [];
    const key = `/${CacheKeyPrefix.VEHICLES}/${stopIds.join(',')}`;
    const vehiclesInCache = await this.cacheManager.get(key);

    if (vehiclesInCache) {
      return vehiclesInCache;
    }

    const indexedStops = await this.stationsService.getStops(feedIndex);

    entities.forEach((entity: any) => {
      const { stopTimeUpdate, trip } = entity.tripUpdate;
      const { routeId, tripId } = trip;
      stopTimeUpdate.forEach((update: any) => {
        if (!update.arrival) {
          return;
        }
        const { stopId, arrival } = update;
        const { time, delay } = arrival;
        if (stopIds.indexOf(update.stopId) > -1
          && time > now
          && time < (now + (MAX_MINUTES * 60))) {

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

    vehicles.sort((a: any, b: any) => (a.time < b.time) ? -1 : 1);
    await this.cacheManager.set(key, vehicles, { ttl: CacheTtlSeconds.THIRTY_SECONDS });
    return await this.cacheManager.get(key);
  }

  public async getTripUpdates(props: {
    feedIndex: number,
    stationIds: string[],
  }) {
    const { feedIndex, stationIds = [] } = props;

    const allStops = await this.stationsService.getStops(feedIndex);
    const stops = stationIds.reduce((stops: any[], stationId: string) => {
      stops = [
        ...stops,
        ...Object.keys(allStops)
          .filter((key: any) => allStops[key].parentStation === stationId)
          .map((key: string) => allStops[key]),
      ]
      return stops;
    }, []);

    const stopIds = stops.map((stop: any) => stop.stopId);

    const routeIds = stops.reduce((routeIds: string[], stop: any) => {
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

    type Entity = {
      id: string;
      tripUpdate: {
        stopTimeUpdate: any[];
      }
    };

    const entities: any = feedMessages.reduce((acc: Entity[], feedMessage) => {
      const tripUpdates = this._getTripUpdateEntities(feedMessage);
      if (tripUpdates.length > 0) {
        acc = [ ...acc, ...tripUpdates];
        return acc;
      }
    }, []);

    const stopTimeUpdates = await this._getStopTimeUpdates({
      feedIndex,
      entities,
      stopIds,
    });

    const routeIdsFromStops = TripUpdatesService._collectRouteIds(stopTimeUpdates);
    return {
      routeIds: routeIdsFromStops,
      stopTimeUpdates,
    };
  }
}