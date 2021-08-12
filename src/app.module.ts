import { CacheInterceptor, CacheModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GtfsModule } from './gtfs/gtfs.module';
import { GeoModule } from './geo/geo.module';
import { TransitModule } from './transit/transit.module';
import { HealthController } from './health/health.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AuthModule } from './auth/auth.module';
import ormconfig from '../ormconfig';

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
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_AUTH,
      ttl: 30,
    }),
    TypeOrmModule.forRoot(),
    GtfsModule,
    GeoModule,
    TransitModule,
    TerminusModule,
    AuthModule,
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

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('');
  }
}
