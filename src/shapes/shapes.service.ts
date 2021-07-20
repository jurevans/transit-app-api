import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Shapes } from 'src/models/entities/shapes.entity';

@Injectable()
export class ShapesService {
  constructor(
    @InjectRepository(Shapes)
    private shapesRepository: Repository<Shapes>,
  ) {}

  async find(shapeId: string) {
    const shapePointsSubQuery = await this.shapesRepository
      .createQueryBuilder('shapes')
      .where(`shapes.shape_id = \'${shapeId}\'`)
      .orderBy('shapes.shape_pt_sequence', 'ASC')
      .select('ST_MakePoint(shapes.shape_pt_lat, shapes.shape_pt_lon)');

    const manager = getManager();

    // Using PostGIS, make a line from an array of points:
    const data = await manager.query(
      `SELECT ST_AsGeoJSON(ST_MakeLine(ARRAY(${shapePointsSubQuery.getQuery()}))) as line`
    );

    // TODO: Join routes with shapeIds, create a FeatureCollection:
    const geometry = JSON.parse(data[0].line);
    return {
      type: 'Feature',
      properties:{
        // ASSOCIATED ROUTES DATA (e.g., name: '1-2-3', color: '', etc.)
      },
      geometry,
    };
  }

  async findShapes() {
    const shapes = await this.shapesRepository
      .createQueryBuilder('shapes')
      .select('shape_id as "shapeId"')
      .distinct(true)
      .getRawMany();

    return await shapes.map((shape: any) => shape.shapeId);
  }
}
