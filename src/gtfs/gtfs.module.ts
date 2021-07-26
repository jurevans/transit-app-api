import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GtfsService } from './gtfs.service';
import { GtfsController } from './gtfs.controller';
import { Agency } from 'src/models/entities/agency.entity';
import { Routes } from 'src/models/entities/routes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, Routes])],
  exports: [TypeOrmModule],
  providers: [GtfsService],
  controllers: [GtfsController],
})
export class GtfsModule {}
