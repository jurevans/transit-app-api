import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routes } from 'src/models/entities/routes.entity';
import { Trips } from 'src/models/entities/trips.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Routes)
    private routesRepository: Repository<Routes>,
  ) {}

  findAll() {
    return this.routesRepository.find({ relations: ['agency'], where: { routeId: '1' }})
    /*
    return this.routesRepository.find({
      select: ['routeId', 'routeLongName'],
      join: {
        alias: 'agency',
        leftJoinAndSelect: {
          routeType: '',
          description: 'routeTypes.description',
        }
      }
    });
    */
  }

  findOne(routeId: string) {
    return this.routesRepository.findOne({ routeId });
  }
}
