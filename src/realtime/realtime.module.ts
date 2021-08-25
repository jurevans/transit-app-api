import { Module, CacheModule, CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Stops } from 'src/entities/stops.entity';
import { Transfers } from 'src/entities/transfers.entity';
import { RealtimeGateway } from './realtime.gateway';
import { TripUpdatesService } from './trip-updates/trip-updates.service';
import { StationsService } from './stations.service';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { FeedService } from './feed/feed.service';
import { AlertsService } from './alerts/alerts.service';
import { CacheTtlSeconds } from 'src/constants';

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
      inject: [ConfigService]
    }),
    HttpModule,
  ],
  exports: [TypeOrmModule],
  providers: [RealtimeGateway, TripUpdatesService, StationsService, FeedService, AlertsService],
})
export class RealtimeModule {}
