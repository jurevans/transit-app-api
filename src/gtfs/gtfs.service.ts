import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import GTFSConfig from '../../config/gtfsRealtime';
import { Agency } from 'src/entities/agency.entity';
import * as GTFS from 'proto/gtfs-realtime';
import { Routes } from 'src/entities/routes.entity';

@Injectable()
export class GtfsService {
  private _EXPIRES: number;
  private _MAX_MINUTES: number;
  private _agency: Agency;
  private _routes: any;
  private _data: any;
  private _lastUpdated: number;
  private _extendsProto: any;

  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {
    this._data = {};
    this._EXPIRES = 60;
    this._MAX_MINUTES = 30;
  }

  private _isExpired() {
    return !this._lastUpdated
      || (DateTime.now().toSeconds() - this._lastUpdated > this._EXPIRES);
  }

  // Update GTFS realtime data if necessary
  private async _update(feedIndex: number) {
    // Initialize agency
    if (!this._agency) {
      this._agency = await this.agencyRepository.findOne({ feedIndex });
    }

    if (!this._routes) {
      // Initialize route lookup
      const routeIdsResults = await this.routesRepository.find({
        select: [ 'routeId'],
        where: { feedIndex },
      });
      this._routes = routeIdsResults.reduce((routes: any, routeIdResult: any) => {
        routes[routeIdResult.routeId] = { stops: {} };
        return routes;
      }, {});
    }

    const { agencyTimezone: TZ, agencyId } = this._agency;
    const config = GTFSConfig[agencyId];
    const { feedUrls, proto } = config;

    if (!this._extendsProto && proto) {
      // Store and attempt to use extension of gtfs-realtime.proto
      // NOTE: This may be removed if deemed not-useful-enough.
      this._extendsProto = proto && await import(`../../proto/${proto}`);
      console.log(`Imported module ${proto}`)
    }

    const { GTFS_REALTIME_ACCESS_KEY } = process.env;
    const options = {
      method: 'GET',
      headers: {
        'x-api-key': GTFS_REALTIME_ACCESS_KEY,
      },
    };

    const results = feedUrls.map(async (endpoint: string) => {
      const response = await fetch(endpoint, options);
      const body = await response.buffer();
      const feed = GTFS.FeedMessage.decode(body);
      return GTFS.FeedMessage.toJSON(feed);
    });

    this._lastUpdated = DateTime.now().toSeconds();
    const data = await Promise.all(results);
    this._data = {
      data,
      updated: this._lastUpdated,
    };
  }

  // Use PostGIS to lookup nearest stations:
  private async _getNearestStops(lon, lat) {
    const manager = getManager();

    return await manager.query(`
      SELECT
        s.stop_name AS "stopName",
        s.stop_id AS "stopId",
        ST_X(ST_Transform(s.the_geom, 4326)) AS "longitude",
        ST_Y(ST_Transform(s.the_geom, 4326)) AS "latitude",
        ST_Distance(s.the_geom, 'SRID=4326;POINT(${lon} ${lat})') AS "distance"
      FROM stops s
      WHERE s.feed_index = ${this._agency.feedIndex}
      ORDER BY
      s.the_geom <-> 'SRID=4326;POINT(${lon} ${lat})'::geometry
      LIMIT 5`
    );
  }

  // Return everything in feed. This is for testing, and is not a practical endpoint:
  public async find(props: { feedIndex: number }) {
    const { feedIndex } = props;
    if (this._isExpired()) {
      await this._update(feedIndex);
    }
    return this._data;
  }

  public async findByLocation(props: { feedIndex: number, lon: number, lat: number }) {
    const { feedIndex, lon, lat } = props;

    if (this._isExpired()) {
      await this._update(feedIndex);
    }

    const nearestStops = await this._getNearestStops(lon, lat);
    const stops = nearestStops.map((station: any) => station.stopId);
    // TODO: Return realtime stop data with these stopIds
    return stops;
  }

  public async findByRouteId(props: { feedIndex: number, routeId: string }) {
    const { feedIndex, routeId } = props;
    if (this._isExpired()) {
      await this._update(feedIndex);
    }
    return [];
  }

  public async findByIds(props: { feedIndex: number, stationIdString: string }) {
    const { feedIndex, stationIdString } = props;
    const stationIds = stationIdString.split(',');
    if (this._isExpired()) {
      await this._update(feedIndex);
    }
    return [];
  }
}
