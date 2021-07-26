import { Controller, Get, Param } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from 'src/models/entities/agency.entity';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get()
  async findAll(): Promise<Agency> {
    return this.agencyService.findOne();
  }

  @Get(':agencyId')
  async findLocation(@Param('agencyId') agencyId: string): Promise<any> {
    return this.agencyService.findLocation({ agencyId });
  }
}
