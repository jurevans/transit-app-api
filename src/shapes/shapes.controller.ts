import { Controller, Get, Param } from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { Shapes } from 'src/models/entities/shapes.entity';

@Controller('shapes')
export class ShapesController {
  constructor(private shapesService: ShapesService) {}

  @Get()
  async findShapes(): Promise<Shapes[]> {
    return this.shapesService.findShapes();
  }

  @Get(':shapeId')
  async find(@Param('shapeId') shapeId: string): Promise<Shapes[]> {
    return this.shapesService.find(shapeId);
  }
}
