import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import GTFSConfig from '../../config/gtfsRealtime';
import fetch from 'node-fetch';
import * as GTFSRealtimeBindings from '../../proto/gtfs-realtime';
import { Agency } from 'src/models/entities/agency.entity';
import { Routes } from 'src/models/entities/routes.entity';

@Injectable()
export class GtfsService {
  private _agency: Agency;
  private _data: any[];
  private _lastUpdated: number;
  private _EXPIRES: number;

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
      const { feedUrls } = config;
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
        const feed = GTFSRealtimeBindings.FeedMessage.decode(body);
        const updated = DateTime.now().setZone(TZ).toISO();

        return {
          data: GTFSRealtimeBindings.FeedMessage.toJSON(feed),
          updated,
        }
      });

      this._lastUpdated = DateTime.now().toSeconds();
      this._data = await Promise.all(results);
    }
  }

  // Return everything. This is a placeholder for testing, and is not
  // a practical endpoint:
  async find(props: { feedIndex: number}) {
    const { feedIndex } = props;

    await this._update(feedIndex);
    return this._data;
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
