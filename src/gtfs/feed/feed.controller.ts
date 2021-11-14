import { CacheTTL, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CacheTtlSeconds } from 'src/constants';
import { IStaticFeed } from '../interfaces/feed.interface';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}
  @Get()
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findAll(): Promise<IStaticFeed[]> {
    return this.feedService.findAll();
  }

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findOne(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
  ): Promise<IStaticFeed> {
    return this.feedService.findOne({ feedIndex });
  }
}
