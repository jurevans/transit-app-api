import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from 'src/models/entities/agency.entity';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findAll() {
    return this.agencyRepository.find();
  }
}
