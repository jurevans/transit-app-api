import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from 'src/entities/agency.entity';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findOne(props: { feedIndex: number }) {
    const { feedIndex } = props;
    return this.agencyRepository.findOneOrFail({ feedIndex });
  }
}
