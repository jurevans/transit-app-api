import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ILocation } from '../interfaces/location.interface';

@Injectable()
export class LocationService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findLocation(params: { feedIndex: number }): Promise<ILocation> {
    const { feedIndex } = params;

    const locationResults = await this.entityManager.query(`
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
      return locationResults[0];
    }
  }
}
