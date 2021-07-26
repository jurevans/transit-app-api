import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { Shapes } from 'src/models/entities/shapes.entity';

@Controller('shapes')
export class ShapesController {
  constructor(private shapesService: ShapesService) {}

  @Get()
  findShapes(
    @Query('day') day?: string,
    @Query('geojson') geojson?: string,
    ): Promise<Shapes[]> {
    return this.shapesService.findShapes(day, geojson);
  }

  @Get(':shapeId')
  async find(@Param('shapeId') shapeId: string): Promise<any> {
    const shapes = this.shapesService.find(shapeId);
    if (!shapes) {
      throw new NotFoundException();
    }
    return shapes;
  }
}
