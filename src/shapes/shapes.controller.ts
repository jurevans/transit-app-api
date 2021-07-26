import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { FeatureCollection, LineString } from 'src/interfaces/geojson';
import { ShapeRawData } from 'src/interfaces/data';

@Controller('shapes')
export class ShapesController {
  constructor(private shapesService: ShapesService) {}

  @Get()
  findShapes(
    @Query('day') day?: string,
    @Query('geojson') geojson?: string,
    ): Promise<FeatureCollection | ShapeRawData> {
    return this.shapesService.findShapes({ day, geojson });
  }

  @Get(':shapeId')
  async find(@Param('shapeId') shapeId: string): Promise<LineString> {
    const shapes = this.shapesService.find(shapeId);
    if (!shapes) {
      throw new NotFoundException();
    }
    return shapes;
  }
}
