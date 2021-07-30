import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, IsNull, Not } from 'typeorm';
import { Agency } from 'src/entities/agency.entity';
import { Routes } from 'src/entities/routes.entity';
import { Stops } from 'src/entities/stops.entity';
import { Feed } from './classes/feed.class';

@Injectable()
export class GtfsService {
  private _feeds: any;
  private _initializedFeeds: any;

  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
  ) {
    this._feeds = {};
    this._initializedFeeds = {};
  }

  private async _getFeed(feedIndex: number) {
    if (!this._initializedFeeds[feedIndex]) {
      const feed = await this._initializeFeed(feedIndex);
      this._feeds[feedIndex] = feed;
      this._initializedFeeds[feedIndex] = true;
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
    const agency = await this.agencyRepository.findOne({ feedIndex });
    const feed = new Feed(agency);
    const stations = await this._getStops(feedIndex, true);
    const stops = await this._getStops(feedIndex, false);
    feed.initializeStations(stations, stops);

    const routeIdsResults = await this.routesRepository.find({
      select: [ 'routeId'],
      where: { feedIndex },
    });
    feed.initializeRoutes(routeIdsResults.map((result: any) => result.routeId));

    return feed;
  }

  // Use PostGIS to lookup nearest stations:
  // TODO: NOPE!
  private async _getNearestStops(props: {
    feedIndex: number,
    lon: number,
    lat: number,
  }) {
    const { feedIndex, lon, lat } = props;
    const manager = getManager();

    return await manager.query(`
      SELECT
        s.stop_name AS "stopName",
        s.stop_id AS "stopId",
        ST_X(ST_Transform(s.the_geom, 4326)) AS "longitude",
        ST_Y(ST_Transform(s.the_geom, 4326)) AS "latitude",
        ST_Distance(s.the_geom, 'SRID=4326;POINT(${lon} ${lat})') AS "distance"
      FROM stops s
      WHERE s.feed_index = ${feedIndex}
      ORDER BY
      s.the_geom <-> 'SRID=4326;POINT(${lon} ${lat})'::geometry
      LIMIT 5`
    );
  }

  // Return everything in feed. This is for testing, and is not a practical endpoint:
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
    const feed = await this._getFeed(feedIndex);
    await feed.update();
/*
    const nearestStops = await this._getNearestStops({ feedIndex, lon, lat });
    const stopIds = nearestStops.map((station: any) => station.stopId);
    const stopTimes = [];

    stopIds.forEach((stopId: string) => {
      const stopTime = this._stationsData[stopId];
      if(stopTime) {
        stopTimes.push({
          stopId: stopTime.stopId,
          time: stopTime.arrival.time,
        });
      }
    });

    return {
      data: stopTimes,
      updated: this._lastUpdated[feedIndex],
    };
*/
    return {
      data: feed.stations,
      updated: feed.lastUpdated,
    }
  }

  public async findByRouteId(props: { feedIndex: number, routeId: string }) {
    const { feedIndex, routeId } = props;
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    return {
      data: feed.routes[routeId],
      updated: feed.lastUpdated,
    };
  }

  public async findByIds(props: { feedIndex: number, stationIdString: string }) {
    const { feedIndex, stationIdString } = props;
    const stationIds = stationIdString.split(',');
    const feed = await this._getFeed(feedIndex);
    await feed.update();

    return stationIds.map((stationId: string) =>
      feed.stations[stationId]);
  }
}
