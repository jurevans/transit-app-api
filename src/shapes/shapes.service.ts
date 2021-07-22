import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ShapeGeoms } from 'src/models/entities/shapeGeoms.entity';
import { Trips } from 'src/models/entities/trips.entity';

@Injectable()
export class ShapesService {
  constructor(
    @InjectRepository(ShapeGeoms)
    private shapeGeomsRepository: Repository<ShapeGeoms>,
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
  ) {}

  async find(shapeId: string) {
    const shape = await this.shapeGeomsRepository
      .createQueryBuilder('shapeGeoms')
      .where(`shapeGeoms.shape_id = \'${shapeId}\'`)
      .select([
        'ST_AsGeoJSON(shapeGeoms.the_geom) as "line"',
        'shapeGeoms.length AS "length"',
      ])
      .getRawOne();

    const routes = await this.tripsRepository
      .createQueryBuilder('trips')
      .innerJoin('trips.routes', 'routes')
      .where('trips.shape_id = :shapeId', { shapeId })
      .select([
        'DISTINCT trips.route_id AS "name"',
        'routes.route_short_name AS "shortName"',
        'routes.route_long_name AS "longName"',
        'routes.route_color AS "color"',
        'routes.route_url AS "url"',
        'routes.route_desc AS "description"',
      ])
      .getRawOne();

    return {
      type: 'Feature',
      properties:{
        ...routes,
        shape_len: shape.length,
      },
      geometry: shape.hasOwnProperty('line') ? JSON.parse(shape.line) : {},
    };
  }

  async findShapes() {
    const manager = getManager();
    // Let's completely bypass the ORM for this one
    const jsonBuilder1 = await manager.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      )
      FROM (
        SELECT
          DISTINCT ON (routes.route_id) routes.route_id,
          routes.route_short_name,
          routes.route_long_name,
          routes.route_color,
          routes.route_desc,
          routes.route_url,
          shape_geoms.length,
          t.shape_id,
          shape_geoms.the_geom
        FROM gtfs.routes
        INNER JOIN trips t
          ON t.route_id = routes.route_id
        INNER JOIN calendar
          ON calendar.service_id = t.service_id
        INNER JOIN shape_geoms
          ON shape_geoms.shape_id = t.shape_id
        WHERE shape_geoms.length = (SELECT MAX(length) from shape_geoms where shape_id = t.shape_id)
      ) AS t("routeId", "name", "longName", "color", "description", "url", "shape_len", "id", "geom");
    `);

    // For any routes missing Shapes, generate LineString geometry
    // using station locations:
    // TODO: These queries should be run one time, generating a new 
    // table that we can access via ORM. Perhaps this should be a required,
    // one-time migration?
    const jsonBuilder2 = await manager.query(`
      WITH routes AS (SELECT
        DISTINCT ON (r.route_id) r.route_id,
        r.route_short_name,
        r.route_long_name,
        r.route_color,
        r.route_desc,
        r.route_url
      FROM gtfs.routes r
      INNER JOIN trips t
        ON t.route_id = r.route_id
      INNER JOIN calendar c
        ON c.service_id = t.service_id
      WHERE t.shape_id IS NULL
        AND t.route_id NOT IN
          (SELECT routes.route_id
          FROM routes
          INNER JOIN trips
          ON trips.route_id = routes.route_id
          WHERE trips.shape_id IS NOT NULL))

      SELECT json_build_object(
              'type', 'FeatureCollection',
              'features', json_agg(ST_AsGeoJSON(t.*)::json)
            )
            FROM (SELECT r.*,
          (SELECT ST_MakeLine(Array(SELECT ST_SetSRID(ST_MakePoint(c.lon, c.lat), 4326)
            FROM (SELECT
              DISTINCT ON (st.stop_sequence) st.stop_sequence,
                st.trip_id,
                stops.stop_lon,
                stops.stop_lat
              FROM stops
              INNER JOIN stop_times st
              ON st.stop_id = stops.stop_id
              WHERE st.trip_id IN (SELECT
                    trips.trip_id
                  FROM trips
                  INNER JOIN calendar
                  ON calendar.service_id = trips.service_id
                  WHERE calendar.monday = 1
                    AND trips.route_id = r.route_id
                    AND trips.direction_id = 0
                  LIMIT 1)
              ORDER BY st.stop_sequence) as c(stop_sequence, trip_id, lon, lat))) as line) line
        FROM routes r) AS t("routeId", "name", "longName", "color", "description", "url", "geom");
    `);

    if (jsonBuilder1.length > 0 && jsonBuilder1[0].hasOwnProperty('json_build_object')) {
      const data = jsonBuilder1[0].json_build_object;
      if (jsonBuilder2.length > 0 && jsonBuilder2[0].hasOwnProperty('json_build_object')) {
        const dataForMissingShapes = jsonBuilder2[0].json_build_object;

        return {
          ...data,
          features: [
            ...data.features,
            ...dataForMissingShapes.features
          ]
        }
      }
    }
    // Should return an error object here:
    throw new Error();
  }
}
