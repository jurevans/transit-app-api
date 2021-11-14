import {
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CacheTtlSeconds } from 'src/constants';
import { IAgency } from '../interfaces/agency.interface';

@Controller('agency')
export class AgencyController {
  constructor(private agencyService: AgencyService) {}

  @Get('feeds/:feedIndexList')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  findOne(
    @Param('feedIndexList', ParseArrayPipe) feedIndices: string[],
  ): Promise<IAgency[]> {
    return this.agencyService.findAll({ feedIndices });
  }
}