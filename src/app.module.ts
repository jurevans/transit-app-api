import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StopsController } from './stops/stops.controller';
import { StopsService } from './stops/stops.service';
import { StopsModule } from './stops/stops.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { AgencyController } from './agency/agency.controller';
import { AgencyService } from './agency/agency.service';
import * as ormconfig from '../ormconfig';
import { AgencyModule } from './agency/agency.module';
import { RoutesController } from './routes/routes.controller';
import { RoutesService } from './routes/routes.service';
import { RoutesModule } from './routes/routes.module';
import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
import { TripsService } from './trips/trips.service';

TypeOrmModule.forRootAsync({
  useFactory: async () =>
    Object.assign(await getConnectionOptions(), {
      ...ormconfig,
      autoLoadEntities: true,
    }),
});

@Module({
  imports: [TypeOrmModule.forRoot(), AgencyModule, StopsModule, RoutesModule, TripsModule ],
  controllers: [AppController, AgencyController, StopsController, RoutesController, TripsController],
  providers: [AppService, AgencyService, StopsService, RoutesService, TripsService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
