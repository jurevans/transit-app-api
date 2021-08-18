import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheKeyPrefix, CacheTtlSeconds } from 'src/constants';
import { FeedService } from '../feed/feed.service';

@Injectable()
export class AlertsService {
  constructor (
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly feedService: FeedService,
  ) {}

  public async getAlerts(feedIndex: number) {
    const { serviceAlertUrl } = this.feedService.getConfig(feedIndex);
    const key = `/${CacheKeyPrefix.ALERTS}/${feedIndex}`;
    const alertsInCache = await this.cacheManager.get(key);

    if (alertsInCache) {
      return alertsInCache;
    }

    const feedMessage = await this.feedService.getFeed({
      feedIndex,
      endpoint: serviceAlertUrl,
    });

    await this.cacheManager.set(key, feedMessage, { ttl: CacheTtlSeconds.ONE_MINUTE });
    return feedMessage;
  }
}
