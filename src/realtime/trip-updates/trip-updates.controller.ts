import {
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TripUpdatesService } from './trip-updates.service';
import { CacheTtlSeconds } from 'src/constants';

@Controller('trip-updates')
export class TripUpdatesController {
  constructor(private readonly tripUpdatesService: TripUpdatesService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.THIRTY_SECONDS)
  async find(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Query('id') stationIdString = '',
  ): Promise<any> {
    const stationIds = stationIdString
      .split(',')
      .map((id: string) => id.trim());
    return await this.tripUpdatesService.getTripUpdates({
      feedIndex,
      stationIds,
    });
  }
}
