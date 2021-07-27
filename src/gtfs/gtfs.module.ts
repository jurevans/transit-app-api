import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GtfsService } from './gtfs.service';
import { GtfsController } from './gtfs.controller';
import { Agency } from 'src/entities/agency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  exports: [TypeOrmModule],
  providers: [GtfsService],
  controllers: [GtfsController],
})
export class GtfsModule {}
