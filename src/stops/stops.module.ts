import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';
import { Stops } from 'src/models/entities/stops.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stops])],
  exports: [TypeOrmModule],
  providers: [StopsService],
  controllers: [StopsController],
})
export class StopsModule {}
