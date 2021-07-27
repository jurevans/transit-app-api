import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from 'src/models/entities/agency.entity';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get(':feedIndex')
  @CacheTTL(86400)
  async findAll(@Param('feedIndex') feedIndex: number): Promise<Agency> {
    return this.agencyService.findOne({ feedIndex });
  }

  @Get('location/:feedIndex')
  @CacheTTL(86400)
  async findLocation(@Param('feedIndex') feedIndex: number): Promise<any> {
    return this.agencyService.findLocation({ feedIndex });
  }
}
