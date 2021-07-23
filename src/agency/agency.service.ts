import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from 'src/models/entities/agency.entity';
import fetch from 'node-fetch';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findOne() {
    return this.agencyRepository.findOneOrFail();
  }

  async findLocation(agencyId: string) {
    const agency = await this.agencyRepository.findOne({
      select: [ 'agencyName'],
      where: { agencyId }
    });

    const { agencyName } = agency;
    const apiUrl = 'http://api.positionstack.com/v1/forward';
    const accessKey = process.env.POSITION_STACK_ACCESS_KEY;
    const query = `${apiUrl}?access_key=${accessKey}&limit=1&output=json&query=${agencyName}`;
    const response = await fetch(query);
    const { data } = await response.json();
    return data;
  }
}
