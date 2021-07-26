import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ShapeGeoms } from 'src/models/entities/shapeGeoms.entity';
import { getCurrentDay } from 'src/util';
import { FeatureCollection, LineString } from 'src/interfaces/geojson';
import { ShapeRawData } from 'src/interfaces/data';

@Injectable()
export class ShapesService {
  constructor(
    @InjectRepository(ShapeGeoms)
    private shapeGeomsRepository: Repository<ShapeGeoms>,
  ) {}

  async find(shapeId: string): Promise<LineString> {
    const shapeData = await this.shapeGeomsRepository
      .createQueryBuilder('shapeGeoms')
      .where(`shapeGeoms.shape_id = \'${shapeId}\'`)
      .select([
        'ST_AsGeoJSON(shapeGeoms.the_geom) as "line"',
        'shapeGeoms.length AS "length"',
      ])
      .getRawOne();

    if (shapeData && shapeData.hasOwnProperty('line')) {
      return JSON.parse(shapeData.line);
    }
  }

  async findShapes(params: {
    day?: string,
    geojson?: string,
  }): Promise<FeatureCollection | ShapeRawData> {
    const { day, geojson } = params;
    const manager = getManager();
    const today = day || getCurrentDay();

    const queryRoutesWithShapes = `
      SELECT
        DISTINCT ON (sg.length) sg.length,
        r.route_id AS "routeId",
        r.route_short_name AS "name",
        r.route_long_name AS "longName",
        r.route_color AS "color",
        r.route_desc AS "description",
        r.route_url AS "url",
        sg.shape_id AS "id",
        sg.the_geom AS "theGeom"
      FROM gtfs.routes r
      INNER JOIN trips t
        ON t.route_id = r.route_id
      INNER JOIN shape_geoms sg
        ON sg.shape_id = t.shape_id
      WHERE t.shape_id IS NOT NULL
    `;

    const geoJsonShapes = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      )
      FROM (
        ${queryRoutesWithShapes}
      ) AS t("shape_len", "routeId", "name", "longName", "color", "description", "url", "id", "geom");
    `;

    // For any routes missing Shapes, generate LineString geometry
    // using station locations:
    // TODO: These queries should be run one time, generating a new 
    // table that we can access via ORM. Perhaps this should be a required,
    // one-time migration?
    const withNullShapesQuery = `
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
      INNER JOIN calendar cal
        ON cal.service_id = t.service_id
      WHERE cal.${today} = 1
        AND t.shape_id IS NULL
        AND t.route_id NOT IN
          (SELECT routes.route_id
          FROM routes
          INNER JOIN trips
          ON trips.route_id = routes.route_id
          WHERE trips.shape_id IS NOT NULL))
    `;

    const queryLinesFromStations = `
      SELECT r.*,
          (SELECT ST_MakeLine(Array(SELECT ST_SetSRID(ST_MakePoint(c.lon, c.lat), 4326)
            FROM (SELECT
              DISTINCT ON (st.stop_sequence) st.stop_sequence,
                st.trip_id,
                stops.stop_lon,
                stops.stop_lat
              FROM stops
              INNER JOIN stop_times st
              ON st.stop_id = stops.stop_id
              WHERE st.trip_id = (SELECT sc.trip_id
                FROM (SELECT DISTINCT on (t.trip_id) t.trip_id,
                  COUNT(st.stop_id) as st_count
                  FROM stop_times st
                  INNER JOIN trips t
                  ON t.trip_id = st.trip_id
                  INNER JOIN calendar cal
                  ON cal.service_id = t.service_id
                  WHERE t.route_id = r.route_id
                    AND cal.${today} = 1
                  GROUP BY t.trip_id
                  ORDER BY t.trip_id, st_count ASC) sc
                ORDER BY sc.st_count DESC
                LIMIT 1)
              ORDER BY st.stop_sequence) as c(stop_sequence, trip_id, lon, lat))) as line) line
        FROM routes r`;

    const geoJsonMissingShapes = `
      ${withNullShapesQuery}
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      )
      FROM (${queryLinesFromStations}) AS t("routeId", "name", "longName", "color", "description", "url", "geom");
    `;

    if (geojson === 'true') {
      const jsonBuilderShapes = await manager.query(geoJsonShapes);
      const jsonBuilderMissingShapes = await manager.query(geoJsonMissingShapes);

      if (jsonBuilderShapes.length > 0 && jsonBuilderShapes[0].hasOwnProperty('json_build_object')) {
        const data = jsonBuilderShapes[0].json_build_object;
        let dataForMissingShapes: FeatureCollection;

        if (jsonBuilderMissingShapes.length > 0 && jsonBuilderMissingShapes[0].hasOwnProperty('json_build_object')) {
          dataForMissingShapes = jsonBuilderMissingShapes[0].json_build_object;
        }

        if (dataForMissingShapes.hasOwnProperty('features')) {
          data.features.push(...dataForMissingShapes.features);
        }
        return data;
      }
    }

    const responseShapes = await manager.query(queryRoutesWithShapes);
    const responseMissingShapes = await manager.query(queryLinesFromStations);

    return [
      ...responseShapes,
      ...responseMissingShapes,
    ];
  }
}
