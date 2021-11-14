import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { CacheTtlSeconds } from 'src/constants';
import { ILocation } from '../interfaces/location.interface';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findLocation(
    @Param('feedIndex') feedIndex: number,
  ): Promise<ILocation> {
    return this.locationService.findLocation({ feedIndex });
  }
}
