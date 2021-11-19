import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoController } from './geo.controller';
import { ShapeGeoms } from 'entities/shapeGeoms.entity';
import { Stops } from 'entities/stops.entity';
import { StopsService } from './stops.service';
import { ShapesService } from './shapes.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShapeGeoms, Stops])],
  exports: [TypeOrmModule],
  providers: [StopsService, ShapesService],
  controllers: [GeoController],
})
export class GeoModule {}
