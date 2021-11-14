import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CacheTtlSeconds } from 'src/constants';
import { IAgency } from '../interfaces/agency.interface';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get('feeds/:feedIndexList')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findOne(
    @Param('feedIndexList') feedIndexList: string,
  ): Promise<IAgency[]> {
    const feedIndices = feedIndexList.split(',');
    return await this.agencyService.findAll({ feedIndices });
  }
}
