import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShapesService } from './shapes.service';
import { ShapesController } from './shapes.controller';
import { ShapeGeoms } from 'src/models/entities/shapeGeoms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShapeGeoms,])],
  exports: [TypeOrmModule],
  providers: [ShapesService],
  controllers: [ShapesController],
})
export class ShapesModule {}
