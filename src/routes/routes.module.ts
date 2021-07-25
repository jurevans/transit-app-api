import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Routes } from 'src/models/entities/routes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routes])],
  exports: [TypeOrmModule],
  providers: [RoutesService],
  controllers: [RoutesController],
})
export class RoutesModule {}
