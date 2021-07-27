import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import GTFSConfig from '../../config/gtfsRealtime';
import fetch from 'node-fetch';
import { Agency } from 'src/models/entities/agency.entity';
import { Routes } from 'src/models/entities/routes.entity';
import * as GTFS from 'proto/gtfs-realtime';

@Injectable()
export class GtfsService {
  private _agency: Agency;
  private _data: any[];
  private _lastUpdated: number;
  private _EXPIRES: number;
  private _extendsProto: any;

  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {
    this._data = [];
    this._EXPIRES = 60;
  }

  private _checkExpires() {
    return !this._lastUpdated
      || (DateTime.now().toSeconds() - this._lastUpdated > this._EXPIRES);
  }

  private async _update(feedIndex: number) {
    if (!this._agency) {
      this._agency = await this.agencyRepository.findOne({ feedIndex });
    }

    if (this._checkExpires()) {
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
        const updated = DateTime.now().setZone(TZ).toISO();

        return {
          data: GTFS.FeedMessage.toJSON(feed),
          updated,
        }
      });

      this._lastUpdated = DateTime.now().toSeconds();
      this._data = await Promise.all(results);
    }
  }

  // Return everything. This is a placeholder for testing, and is not
  // a practical endpoint:
  async find(props: { feedIndex: number }) {
    const { feedIndex } = props;

    await this._update(feedIndex);
    return this._data;
  }

  findByLocation(props: { feedIndex: number, lon: number, lat: number }) {
    const { feedIndex, lon, lat } = props;
    return [];
  }

  findByRouteId(props: { feedIndex: number, routeId: string }) {
    const { feedIndex, routeId } = props;
    return [];
  }

  findByIds(props: { feedIndex: number, stationIdString: string }) {
    const { feedIndex, stationIdString } = props;
    const stationIds = stationIdString.split(',');
    return [];
  }
  async findRouteIds(props: { feedIndex: number}): Promise<any> {
    const { feedIndex } = props;
    const routeIdsResults = await this.routesRepository.find({
      select: [ 'routeId'],
      where: { feedIndex },
    });
    return {
      data: routeIdsResults.map((routeIdResult: any) => routeIdResult.routeId),
      updated: DateTime.now().toISO(),
    };
  }
}
