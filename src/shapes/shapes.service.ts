import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shapes } from 'src/models/entities/shapes.entity';

@Injectable()
export class ShapesService {
  constructor(
    @InjectRepository(Shapes)
    private shapesRepository: Repository<Shapes>,
  ) {}

  async find(shapeId: string) {
    return this.shapesRepository
      .createQueryBuilder('shapes')
      .where('shapes.shape_id = :shapeId', { shapeId })
      .getMany();
  }
}