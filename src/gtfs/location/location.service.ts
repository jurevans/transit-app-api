import { getManager } from 'typeorm';
import { ILocation } from '../interfaces/location.interface';

export class LocationService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async findLocation(params: { feedIndex: number }): Promise<ILocation> {
    const { feedIndex } = params;
    const manager = getManager();
    const locationResults = await manager.query(`
      WITH centroid AS (
        SELECT ST_Centroid(geom) center
        FROM (SELECT ST_Multi(ST_Union(the_geom))::geometry(MultiPoint, 4326) AS geom
            FROM stops s
            WHERE s.feed_index = ${feedIndex}
          ) AS geom
      )
      SELECT ST_X(center) longitude, ST_Y(center) latitude FROM centroid;
    `);

    if (locationResults.length > 0) {
      const { longitude, latitude } = locationResults[0];
      return {
        longitude,
        latitude,
      };
    }
  }
}
