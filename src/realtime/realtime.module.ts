import { Module, CacheModule, CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Stops } from 'entities/stops.entity';
import { Transfers } from 'entities/transfers.entity';
import { RealtimeGateway } from './realtime.gateway';
import { TripUpdatesService } from './trip-updates/trip-updates.service';
import { StationsService } from './stations/stations.service';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { FeedService } from './feed/feed.service';
import { AlertsService } from './alerts/alerts.service';
import { CacheTtlSeconds } from 'constants/';
import { RealtimeController } from './realtime.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Stops, Transfers]),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService): CacheModuleOptions => ({
        store: redisStore,
        ...configService.get('redis'),
        ttl: CacheTtlSeconds.THIRTY_SECONDS,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  exports: [TypeOrmModule],
  providers: [
    RealtimeGateway,
    TripUpdatesService,
    StationsService,
    FeedService,
    AlertsService,
  ],
  controllers: [RealtimeController],
})
export class RealtimeModule {}
