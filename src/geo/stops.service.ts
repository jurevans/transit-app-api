import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Stops } from 'src/entities/stops.entity';
import { getCurrentDay } from 'src/util';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
  ) {}

  async findAll(props: { feedIndex: number; day?: string; geojson?: boolean }) {
    const { feedIndex, day, geojson } = props;
    const manager = getManager();
    const today = day || getCurrentDay();

    const withRoutes = `
      WITH
      routes AS (
        SELECT
          DISTINCT ON (r.route_id) r.route_id,
          r.route_short_name,
          r.route_long_name,
          r.route_color,
          r.route_desc,
          r.route_url,
          t.trip_id AS trip_id
        FROM gtfs.routes r
        INNER JOIN trips t
          ON t.route_id = r.route_id
        INNER JOIN calendar cal
          ON cal.service_id = t.service_id
        WHERE cal.${today} = 1),
      stops AS (
        SELECT
          s.stop_lon,
          s.stop_lat,
          s.stop_name,
          s.parent_station,
          r.route_id,
          s.feed_index
        FROM routes r
        INNER JOIN trips t
        ON t.route_id = r.route_id
        INNER JOIN stop_times st
        ON st.trip_id = t.trip_id
        INNER JOIN stops s
        ON s.stop_id = st.stop_id
        INNER JOIN calendar cal
        ON cal.service_id = t.service_id
        WHERE cal.${today} = 1
        AND s.feed_index = ${feedIndex}
        GROUP BY s.stop_lon, s.stop_lat, s.stop_name, r.route_id, s.parent_station, s.feed_index
        ORDER BY r.route_id ASC)
    `;

    const query = `
      SELECT
        DISTINCT ON (s.parent_station) s.parent_station,
        string_agg(s.route_id, '-') AS "routeIds",
        string_agg(r.route_short_name, '-') as "routeNames",
        string_agg(r.route_long_name, '#') as "routeLongNames",
        string_agg(r.route_color, '-') as "routeColors",
        string_agg(r.route_url, '|') as "routeUrls",
        s.stop_name as "name",
        ST_SetSRID(ST_MakePoint(s.stop_lon, s.stop_lat), 4326) AS "theGeom"
      FROM stops s
      INNER JOIN routes r
      ON s.route_id = r.route_id
      WHERE s.feed_index = ${feedIndex}
      GROUP BY s.stop_lon, s.stop_lat, s.stop_name, s.parent_station
    `;

    const jsonBuilder = `
      ${withRoutes}
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        )
      FROM (${query})
      AS t("id", "routeIds", "routeNames", "routeLongNames", "routeColors", "routeUrls", "name", "geom")
    `;

    if (geojson) {
      const jsonBuilderData = await manager.query(jsonBuilder);
      if (
        jsonBuilderData.length > 0 &&
        jsonBuilderData[0].hasOwnProperty('json_build_object') &&
        jsonBuilderData[0].json_build_object.features !== null
      ) {
        return jsonBuilderData[0].json_build_object;
      } else {
        return null;
      }
    }

    return manager.query(`
      ${withRoutes}
      ${query}
    `);
  }

  findOne(props: { feedIndex: number; stopId: string }): Promise<Stops> {
    const { feedIndex, stopId } = props;
    return this.stopsRepository.findOne({ where: { feedIndex, stopId } });
  }
}
