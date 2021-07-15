import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trips } from 'src/models/entities/trips.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trips)
    private tripsRepository: Repository<Trips>,
  ) {}

  findForService(serviceId: string) {
    return this.tripsRepository.find({ where: { serviceId }, relations: ['routes', 'calendar'] });
  }
}
