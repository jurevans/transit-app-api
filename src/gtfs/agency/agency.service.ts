import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Agency } from 'entities/agency.entity';
import { IAgency } from '../interfaces/agency.interface';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findAll(props: { feedIndices: string[] }): Promise<IAgency[]> {
    const { feedIndices } = props;
    return this.agencyRepository.find({
      select: [
        'feedIndex',
        'agencyId',
        'agencyName',
        'agencyUrl',
        'agencyTimezone',
        'agencyPhone',
        'agencyLang',
      ],
      where: { feedIndex: In(feedIndices) },
    });
  }
}
