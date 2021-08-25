import { CacheTTL, Controller, Get, Param } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedInfo } from 'src/entities/feedInfo.entity';
import { CacheTtlSeconds } from 'src/constants';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}
  @Get()
  @CacheTTL(86400)
  async find(): Promise<FeedInfo[]> {
    return this.feedService.find();
  }

  @Get(':feedIndex')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findAll(@Param('feedIndex') feedIndex: number): Promise<FeedInfo> {
    return this.feedService.findOne({ feedIndex });
  }
}
