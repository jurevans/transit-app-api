import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Agency } from 'src/entities/agency.entity';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findOne(props: { feedIndices: string[] }) {
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
