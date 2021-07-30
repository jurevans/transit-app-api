import * as GTFS from 'proto/gtfs-realtime';
import { Agency } from 'src/entities/agency.entity';
import { Stops } from 'src/entities/stops.entity';
import GTFSConfig from '../../../config/gtfsRealtime';
import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import { Station } from './station.class';
/**
 * Class to store Feed instance
 */
export class Feed {
  public agency;
  public routes;
  public stations;
  public stopsIndex;
  public lastUpdated: number;
  public data;

  private _config;
  private _extendsProto;
  private _stationsData;

  private _MAX_MINUTES: number;
  private _EXPIRES: number;

  constructor (agency: Agency) {
    this.agency = agency;
    this._config = GTFSConfig.find((config: any) =>
      config.feedIndex === agency.feedIndex
      && config.agencyId === agency.agencyId);

    this._stationsData = {};
    this._getExtendsProto();
    this.stations = {};

    this._MAX_MINUTES = 30;
    this._EXPIRES = 60;
  }

  private _isExpired() {
    return !this.lastUpdated
      || (DateTime.now().toSeconds() - this.lastUpdated > this._EXPIRES);
  }

  private async _getExtendsProto() {
    const { proto } = this._config;
    if (!this._extendsProto && proto) {
      this._extendsProto = await import(`../../../proto/${proto}`);
    }
  }

  // Check for override config to translate routeId if needed:
  private _checkRouteIdOverride(routeId: string) {
    const config = this._config;
    if (!config.hasOwnProperty('routeIdOverrides')) {
      return routeId;
    }
    const override = config.routeIdOverrides[routeId];
    return override ? override : routeId;
  }

  // Provide a mapping of stop to parent station:
  private _indexStops(stations: any) {
    const stops = {};
    for (const id in stations) {
      for (const stopId in stations[id].stops) {
        stops[stopId] = id;
      }
    }
    return stops;
  }

  public initializeStations(stations: any, stops: Stops[]): void {
    stations.forEach((station: any) => {
      this._stationsData[station.stopId] = {
        id: station.stopId,
        name: station.stopName,
        location: [
          station.stopLon,
          station.stopLat,
        ],
        stops: stops
          .filter((stop: Stops) => stop.parentStation === station.stopId)
          .map((stop: Stops) => ({
            id: stop.stopId,
            location: [
              stop.stopLon,
              stop.stopLat,
            ]
          }))
          .reduce((obj: any, stop: any) => {
            obj[stop.id] = stop;
            return obj;
          }, {})
      };
    });

    for (const id in this._stationsData) {
      // Instantiate Station classes
      this.stations[id] = new Station(this._stationsData[id]);
    }

    if (!this.stopsIndex) {
      // Initialize stops to parent station index
      this.stopsIndex = this._indexStops(this._stationsData);
    }
  }

  public initializeRoutes(routeIds: string[] = []) {
    this.routes = routeIds.reduce((routes: any, routeId: any) => {
      routes[routeId] = [];
      return routes;
    }, {});
  }

  public async update() {
    if (!this._isExpired()) {
      return;
    }

    for (const id in this.stations) {
      this.stations[id].clearTrainData();
    }

    const { feedUrls, accessKey } =  this._config;
    const GTFS_REALTIME_ACCESS_KEY = process.env[accessKey];
    const options = {
      method: 'GET',
      headers: {
        'x-api-key': GTFS_REALTIME_ACCESS_KEY,
      },
    };

    const results = feedUrls.map(async (endpoint: string): Promise<any> => {
      const response = await fetch(endpoint, options);
      const body = await response.buffer();
      const feed = GTFS.FeedMessage.decode(body);
      return GTFS.FeedMessage.toJSON(feed);
    });

    const data = await Promise.all(results);
    this.lastUpdated = DateTime.now().toSeconds();

    data.forEach((feedResponse: any) => {
      const entities = feedResponse.entity;
      entities.forEach((entity: any) => {
        if (entity.tripUpdate) {
          const { trip, stopTimeUpdate } = entity.tripUpdate;
          const { routeId } = trip;

          stopTimeUpdate.forEach((stop: any) => {
            const stopTime = stop.arrival?.time;
            if (!stopTime) {
              return;
            }
            if (!(stopTime < this.lastUpdated)
              && !(stopTime > (this.lastUpdated + (this._MAX_MINUTES * 60)))) {
              const stationId = this.stopsIndex[stop.stopId];
              const station = this.stations[stationId];

              if (station) {
                station.addTrain({
                  routeId,
                  trainTime: stopTime,
                  feedTime: this.lastUpdated,
                });
              }

              const useRouteId = this._checkRouteIdOverride(routeId);
              this.routes[useRouteId].push(stop.stopId);
            }
          });
        }
      })
    });

    this.data = data;
  }
}
