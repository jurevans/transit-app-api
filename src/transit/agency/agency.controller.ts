import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from 'src/entities/agency.entity';
import { CacheTtlSeconds } from 'src/constants';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get('feeds/:feedIndexList')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findOne(
    @Param('feedIndexList') feedIndexList: string,
  ): Promise<Agency[]> {
    const feedIndices = feedIndexList.split(',');
    return await this.agencyService.findOne({ feedIndices });
  }
}
