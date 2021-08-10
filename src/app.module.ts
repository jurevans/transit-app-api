import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { GtfsModule } from './gtfs/gtfs.module';
import { GeoModule } from './geo/geo.module';
import { TransitModule } from './transit/transit.module';

import ormconfig from '../ormconfig';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';

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
    GtfsModule,
    GeoModule,
    TransitModule,
    TerminusModule,
  ],
  controllers: [
    AppController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    AppService,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
