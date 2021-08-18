import { CacheInterceptor, CacheModule, CacheModuleOptions, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
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
import { RealtimeModule } from './realtime/realtime.module';
import gtfsRealtimeConfig from './config/gtfs.config';
import redisConfig from './config/redis.config';
import databaseConfig from './config/database.config';
import { CacheTtlSeconds } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [gtfsRealtimeConfig, redisConfig, databaseConfig],
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService): CacheModuleOptions => ({
        store: redisStore,
        ...configService.get('redis'),
        ttl: CacheTtlSeconds.THIRTY_SECONDS,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleAsyncOptions> =>
        Object.assign(await getConnectionOptions(), {
          ...configService.get('database'),
          autoLoadEntities: true,
        }),
        inject: [ConfigService],
    }),
    GtfsModule,
    GeoModule,
    TransitModule,
    TerminusModule,
    AuthModule,
    RealtimeModule,
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
