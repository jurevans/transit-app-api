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

  find(shapeId: string) {
    return this.shapesRepository
      .createQueryBuilder('shapes')
      .where('shapes.shape_id = :shapeId', { shapeId })
      .orderBy('shapes.shape_pt_sequence', 'ASC')
      .getMany();
  }

  findShapes() {
    return this.shapesRepository
      .createQueryBuilder('shapes')
      .select('shape_id')
      .distinct(true)
      .getRawMany();
  }
}
