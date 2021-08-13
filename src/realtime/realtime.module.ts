import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stops } from 'src/entities/stops.entity';
import { Transfers } from 'src/entities/transfers.entity';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stops, Transfers])],
  exports: [TypeOrmModule],
  providers: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}
