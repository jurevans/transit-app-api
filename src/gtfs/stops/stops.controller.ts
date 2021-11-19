import { CacheTTL, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CacheTtlSeconds } from 'constants/';
import { IParentStation } from '../interfaces/stops.interface';
import { StopsService } from './stops.service';

@Controller('stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  findStops(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<IParentStation[]> {
    return this.stopsService.findStops({ feedIndex });
  }

  @Get(':feedIndex/transfers')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  findTransfers(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<any[]> {
    return this.stopsService.findTransfers({ feedIndex });
  }
}
