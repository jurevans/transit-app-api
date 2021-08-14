import { Module, CacheModule, CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stops } from 'src/entities/stops.entity';
import { Transfers } from 'src/entities/transfers.entity';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { StationsService } from './stations/stations.service';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Stops, Transfers]), 
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService): CacheModuleOptions => ({
        store: redisStore,
        ...configService.get('redis'),
        ttl: 0,
      }),
      inject: [ConfigService]
    }),
  ],
  exports: [TypeOrmModule],
  providers: [RealtimeGateway, RealtimeService, StationsService],
})
export class RealtimeModule {}
