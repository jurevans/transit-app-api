import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import { StationsService } from './stations/stations.service';
import * as GTFS from 'proto/gtfs-realtime';

const VEHICLE_PREFIX = 'vehicles';
const MAX_MINUTES = 30;

@Injectable()
export class RealtimeService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly stationsService: StationsService,
  ) {}

  private _getConfig(feedIndex: number) {
    return this.configService.get('gtfs-realtime')
      .find((config: any) => config.feedIndex == feedIndex);
  }

  private _getUrls(feedUrls: any[], routeIds: string[]) {
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
    const { feedUrls, accessKey } = this._getConfig(feedIndex);
    const accessKeyValue = this.configService.get(accessKey);
    // Which of these URLs should I use?
    const urls = this._getUrls(feedUrls, routeIds);
    const options = {
      method: 'GET',
      headers: {
        'x-api-key': accessKeyValue,
      },
    };
    // Add the following fetches to a queue instead?
    return Promise.all(urls.map(async (endpoint: string) => {
      // Check Redis for cached response:
      const feedMessageInCache = await this.cacheManager.get(endpoint);
      if (feedMessageInCache) {
        return feedMessageInCache;
      }

      // Make new request and cache:
      const response = await fetch(endpoint, options);
      const body = await response.buffer();
      const feed = GTFS.FeedMessage.decode(body);
      const feedMessage = GTFS.FeedMessage.toJSON(feed);
      await this.cacheManager.set(endpoint, feedMessage, { ttl: 30 })
      return await this.cacheManager.get(endpoint);
    }));
  }

  private _getTripUpdateEntities(feedMessage: any) {
    return feedMessage.entity.filter((entity: any) => entity.hasOwnProperty('tripUpdate'));
  }

  private async _getStopTimeUpdates(entities: any[], stopIds: string[]) {
    const now = DateTime.now().toSeconds();
    const vehicles = {};
    const key = `/${VEHICLE_PREFIX}/${stopIds.join(',')}`;
    const vehiclesInCache = await this.cacheManager.get(key);

    if (vehiclesInCache) {
      return vehiclesInCache;
    }

    entities.forEach((entity: any) => {
      const { stopTimeUpdate, trip } = entity.tripUpdate;
      stopTimeUpdate.forEach((update: any) => {
        if (!update.arrival) {
          return;
        }
        const { stopId, arrival } = update;
        const { time, delay } = arrival;
        if (stopIds.indexOf(update.stopId) > -1
          && time > now - (MAX_MINUTES * 60)) {
          if (!vehicles[stopId]) {
            vehicles[stopId] = [];
          }
          vehicles[stopId].push({
            stopId,
            time,
            delay,
            routeId: trip.routeId,
            tripId: trip.tripId,
          });
        }
      });
    });
    await this.cacheManager.set(key, vehicles, { ttl: 30 });
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

    const stopTimeUpdates = await this._getStopTimeUpdates(
      entities,
      stopIds,
    );

    return stopTimeUpdates;
  }
}
