import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency/agency.service';
import { AgencyController } from './agency/agency.controller';
import { RoutesService } from './routes/routes.service';
import { RoutesController } from './routes/routes.controller';
import { LocationService } from './location/location.service';
import { LocationController } from './location/location.controller';
import { Routes } from 'src/entities/routes.entity';
import { Trips } from 'src/entities/trips.entity';
import { Agency } from 'src/entities/agency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, Routes, Trips])],
  exports: [TypeOrmModule],
  providers: [AgencyService, RoutesService, LocationService],
  controllers: [AgencyController, RoutesController, LocationController],
})
export class TransitModule {}
