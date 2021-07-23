import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';
import { Stops } from 'src/models/entities/stops.entity';
import { StopTimes } from 'src/models/entities/stopTimes.entity';
import { Routes } from 'src/models/entities/routes.entity';
import { Trips } from 'src/models/entities/trips.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stops, StopTimes, Routes, Trips])],
  exports: [TypeOrmModule],
  providers: [StopsService],
  controllers: [StopsController],
})
export class StopsModule {}
