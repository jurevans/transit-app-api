import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency/agency.service';
import { AgencyController } from './agency/agency.controller';
import { RoutesService } from './routes/routes.service';
import { RoutesController } from './routes/routes.controller';
import { LocationService } from './location/location.service';
import { LocationController } from './location/location.controller';
import { FeedService } from './feed/feed.service';
import { FeedController } from './feed/feed.controller';
import { Routes } from 'src/entities/routes.entity';
import { Trips } from 'src/entities/trips.entity';
import { Agency } from 'src/entities/agency.entity';
import { FeedInfo } from 'src/entities/feedInfo.entity';
import { Stops } from 'src/entities/stops.entity';
import { StopsService } from './stops/stops.service';
import { StopsController } from './stops/stops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, Routes, Trips, FeedInfo, Stops])],
  exports: [TypeOrmModule],
  providers: [
    AgencyService,
    RoutesService,
    LocationService,
    FeedService,
    StopsService,
  ],
  controllers: [
    AgencyController,
    RoutesController,
    LocationController,
    FeedController,
    StopsController,
  ],
})
export class GTFSModule {}
