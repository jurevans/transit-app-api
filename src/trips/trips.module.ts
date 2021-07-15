import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trips } from 'src/models/entities/trips.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trips])],
  exports: [TypeOrmModule],
  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
