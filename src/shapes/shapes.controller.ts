import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { Shapes } from 'src/models/entities/shapes.entity';

@Controller('shapes')
export class ShapesController {
  constructor(private shapesService: ShapesService) {}

  @Get()
  async findShapes(@Query('geojson') geojson?: string): Promise<Shapes[]> {
    return this.shapesService.findShapes(geojson);
  }

  @Get(':shapeId')
  async find(@Param('shapeId') shapeId: string): Promise<any> {
    return this.shapesService.find(shapeId);
  }
}
