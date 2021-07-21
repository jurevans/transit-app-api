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
    // Get array of shapeIds:
    /*
    const shapes = await this.shapeGeomsRepository
      .createQueryBuilder('shapeGeom')
      .select('shape_id as "shapeId"')
      .distinct(true)
      .getRawMany();

    return await shapes.map((shape: any) => shape.shapeId)
    */
    const manager = getManager();
    // Let's completely bypass the ORM for this one:
    const jsonBuilder = await manager.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
      )
      FROM (
        SELECT
          DISTINCT trips.route_id,
          routes.route_color,
          routes.route_long_name,
          routes.route_desc,
          routes.route_url,
          shape_geoms.length,
          shape_geoms.the_geom
        FROM gtfs.shape_geoms
        INNER JOIN gtfs.trips trips
        ON trips.shape_id = shape_geoms.shape_id
        INNER JOIN gtfs.routes routes
        ON trips.route_id = routes.route_id
      ) AS t(name, color, longName, description, url, shape_len, geom);
    `);

    if (jsonBuilder.length > 0 && jsonBuilder[0].hasOwnProperty('json_build_object')) {
      return jsonBuilder[0].json_build_object;
    }
    // Should return an error object here:
    throw new Error();
  }
}
