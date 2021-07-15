import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stops } from 'src/models/entities/stops.entity';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stops)
    private stopsRepository: Repository<Stops>,
  ) {}

  findAll() {
    return this.stopsRepository.find();
  }

  findOne(stopId: string) {
    // Do stuff with tripId:
    return this.stopsRepository.findOne({ stopId });
  }
}
