import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StopsService } from './geo/stops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { AgencyController } from './agency/agency.controller';
import { AgencyService } from './agency/agency.service';
import { RoutesController } from './routes/routes.controller';
import { RoutesService } from './routes/routes.service';
import { RoutesModule } from './routes/routes.module';
import { ShapesService } from './geo/shapes.service';
import { GtfsController } from './gtfs/gtfs.controller';
import { GtfsService } from './gtfs/gtfs.service';
import { GtfsModule } from './gtfs/gtfs.module';
import { GeoModule } from './geo/geo.module';

import ormconfig from '../ormconfig';
import { APP_INTERCEPTOR } from '@nestjs/core';

TypeOrmModule.forRootAsync({
  useFactory: async () =>
    Object.assign(await getConnectionOptions(), {
      ...ormconfig,
      autoLoadEntities: true,
    }),
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({ ttl: 30 }),
    TypeOrmModule.forRoot(),
    RoutesModule,
    GtfsModule,
    GeoModule,
  ],
  controllers: [
    AppController, 
    AgencyController, 
    RoutesController, 
    GtfsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    AppService,
    AgencyService,
    StopsService,
    RoutesService,
    ShapesService,
    GtfsService,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
