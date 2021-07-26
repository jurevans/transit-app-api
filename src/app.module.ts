import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StopsController } from './stops/stops.controller';
import { StopsService } from './stops/stops.service';
import { StopsModule } from './stops/stops.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { AgencyController } from './agency/agency.controller';
import { AgencyService } from './agency/agency.service';
import { AgencyModule } from './agency/agency.module';
import { RoutesController } from './routes/routes.controller';
import { RoutesService } from './routes/routes.service';
import { RoutesModule } from './routes/routes.module';
import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
import { TripsService } from './trips/trips.service';
import { ShapesController } from './shapes/shapes.controller';
import { ShapesService } from './shapes/shapes.service';
import { ShapesModule } from './shapes/shapes.module';
import { GtfsController } from './gtfs/gtfs.controller';
import { GtfsService } from './gtfs/gtfs.service';
import { GtfsModule } from './gtfs/gtfs.module';

import ormconfig from '../ormconfig';

TypeOrmModule.forRootAsync({
  useFactory: async () =>
    Object.assign(await getConnectionOptions(), {
      ...ormconfig,
      autoLoadEntities: true,
    }),
});

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRoot(), AgencyModule, StopsModule, RoutesModule, TripsModule, ShapesModule, GtfsModule],
  controllers: [AppController, AgencyController, StopsController, RoutesController, TripsController, ShapesController, GtfsController],
  providers: [AppService, AgencyService, StopsService, RoutesService, TripsService, ShapesService, GtfsService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
