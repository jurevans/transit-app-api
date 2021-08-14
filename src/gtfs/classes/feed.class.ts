import * as GTFS from 'proto/gtfs-realtime';
import { Stops } from 'src/entities/stops.entity';
import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import { Station } from './station.class';
/**
 * Class to store Feed instance
 */
export class Feed {
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
  private _ACCESS_KEY: string;

  constructor (config: any, accessKey: string) {
    this._config = config;
    this._stationsData = {};
    this._getExtendsProto();
    this.stations = {};

    this._MAX_MINUTES = 30;
    this._EXPIRES = 30;
    this._ACCESS_KEY = accessKey;
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

  public async update(routeIds: string[] = []) {
    if (!this._isExpired()) {
      return;
    }

    for (const id in this.stations) {
      this.stations[id].clearTrainData();
    }

    const { feedUrls } =  this._config;
    const options = {
      method: 'GET',
      headers: {
        'x-api-key': this._ACCESS_KEY,
      },
    };

    // Filter by routeId if provided, otherwise, return all endpoint URLs:
    const urls = feedUrls
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

    const results = urls.map(async (endpoint: string): Promise<any> => {
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
          const { routeId, tripId } = trip;

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
                  tripId,
                  stopId: stop.stopId,
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
