import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { CacheTtlSeconds } from 'src/constants';
import { IParentStation } from '../interfaces/stops.interface';
import { StopsService } from './stops.service';

@Controller('stops')
export class StopsController {
  constructor(private stopsService: StopsService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findStops(
    @Param('feedIndex') feedIndex: number,
  ): Promise<IParentStation[]> {
    return this.stopsService.findStops({ feedIndex });
  }

  @Get(':feedIndex/transfers')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findTransfers(@Param('feedIndex') feedIndex: number): Promise<any[]> {
    return this.stopsService.findTransfers({ feedIndex });
  }
}
