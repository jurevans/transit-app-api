import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get(':feedIndex')
  @CacheTTL(86400)
  async findLocation(@Param('feedIndex') feedIndex: number): Promise<any> {
    return this.locationService.findLocation({ feedIndex });
  }
}
