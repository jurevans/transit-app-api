import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Routes } from 'src/entities/routes.entity';
import { Stops } from 'src/entities/stops.entity';
import { Feed } from './classes/feed.class';
import { Station } from './classes/station.class';
import { getDistance } from 'src/util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GtfsService {
  private _feeds: any;

  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
    private configService: ConfigService,
  ) {
    this._feeds = {};
  }

  private async _getFeed(feedIndex: number) {
    if (!this._feeds[feedIndex]) {
      const feed = await this._initializeFeed(feedIndex);
      this._feeds[feedIndex] = feed;
    }
    return this._feeds[feedIndex];
  }

  private async _getStops(feedIndex: number, isParent: boolean): Promise<Stops[]> {
    const stops = await this.stopsRepository.find({
      where: {
        feedIndex,
        parentStation: isParent ? IsNull() : Not(IsNull()),
      },
    });
    return stops;
  }

  private async _initializeFeed(feedIndex: number) {
    const configs = this.configService.get('gtfs-realtime');
    const config = configs.find((config: any) => config.feedIndex == feedIndex);
    const { accessKey } = config;
    const accessKeyValue = this.configService.get(accessKey);
    const feed = new Feed(config, accessKeyValue);
    const stations = await this._getStops(feedIndex, true);
    const stops = await this._getStops(feedIndex, false);
    feed.initializeStations(stations, stops);

    return feed;
  }

  // Return everything in the raw feed.
  // This is for testing, and is not a practical endpoint:
  public async find(props: { feedIndex: number }) {
    const { feedIndex } = props;
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    return {
      data: feed.data,
      updated: feed.lastUpdated,
    };
  }

  public async findByLocation(props: { feedIndex: number, lon: number, lat: number }) {
    const { feedIndex, lon, lat } = props;
    const LIMIT = 5;
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    const sortableStations = Object.values(feed.stations);
    const stations = sortableStations.map((station: Station) => station.serialize());

    stations.sort((a: any, b: any) => {
      const dist1 = getDistance([lon, lat], a.location);
      const dist2 = getDistance([lon, lat], b.location);
      return dist1 - dist2;
    });

    return {
      data: stations.slice(0, LIMIT),
      updated: feed.lastUpdated,
    }
  }

  public async findByRouteId(props: { feedIndex: number, routeId: string }) {
    const { feedIndex, routeId } = props;
    const useRouteId = routeId.toUpperCase();
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    const stopsForRoute = feed.routes[useRouteId];
    const stations = {};

    stopsForRoute.forEach((stopId: string) => {
      const stationId = feed.stopsIndex[stopId];
      const station = feed.stations[stationId];
      if (!stations[stationId] && station) {
        stations[stationId] = station.serialize();
      }
    });

    return {
      data: stations,
      updated: feed.lastUpdated,
    };
  }

  public async findByIds(props: { feedIndex: number, stationIdString: string }) {
    const { feedIndex, stationIdString } = props;
    const stationIds = stationIdString.split(',');
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    return {
      data: stationIds.map((stationId: string) =>
        feed.stations[stationId].serialize()),
      updated: feed.lastUpdated,
    };
  }
}
