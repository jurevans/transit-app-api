import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from 'src/models/entities/agency.entity';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get()
  @CacheTTL(86400)
  async findAll(): Promise<Agency> {
    return this.agencyService.findOne();
  }

  @Get(':agencyId')
  @CacheTTL(86400)
  async findLocation(@Param('agencyId') agencyId: string): Promise<any> {
    return this.agencyService.findLocation({ agencyId });
  }
}
