import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Routes } from 'src/models/entities/routes.entity';
import { Trips } from 'src/models/entities/trips.entity';
import { StopTimes } from 'src/models/entities/stopTimes.entity';
import { Shapes } from 'src/models/entities/shapes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routes, Trips, StopTimes, Shapes])],
  exports: [TypeOrmModule],
  providers: [RoutesService],
  controllers: [RoutesController],
})
export class RoutesModule {}
