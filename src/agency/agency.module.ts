import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { Agency } from 'src/models/entities/agency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  exports: [TypeOrmModule],
  providers: [AgencyService],
  controllers: [AgencyController],
})
export class AgencyModule {}
