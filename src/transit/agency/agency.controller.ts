import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from 'src/entities/agency.entity';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get(':feedIndex/id/:agencyId')
  @CacheTTL(86400)
  async findAll(
    @Param('feedIndex') feedIndex: number,
    @Param('agencyId') agencyId: string,
  ): Promise<Agency> {
    return this.agencyService.findOne({ feedIndex, agencyId });
  }
}