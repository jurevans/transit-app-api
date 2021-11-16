import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { FeedService } from '../feed/feed.service';
import { CacheKeyPrefix, CacheTtlSeconds } from 'constants/';
import { formatCacheKey, getConfigByFeedIndex } from 'util/';
import { IAlerts } from '../interfaces/alerts.interface';
import { IRealtimeFeed } from '../interfaces/feed.interface';

@Injectable()
export class AlertsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly feedService: FeedService,
    private readonly configService: ConfigService,
  ) {}

  public async getAlerts(feedIndex: number): Promise<IAlerts> {
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );
    const { serviceAlertUrl } = config;
    const key = formatCacheKey(CacheKeyPrefix.ALERTS, feedIndex);
    const alertsInCache: IAlerts = await this.cacheManager.get(key);

    if (alertsInCache) {
      return alertsInCache;
    }

    const feed: IRealtimeFeed = await this.feedService.getFeed({
      feedIndex,
      endpoint: serviceAlertUrl,
    });

    const entities = feed.entity;
    const alerts = entities.map((entity: any) => {
      const { alert } = entity;
      const { cause, effect } = alert;
      const { routeId, trip } = alert.informedEntity[0];
      const activePeriod = alert.activePeriod[0];
      const headerText = alert.headerText.translation[0].text;
      const descriptionText = alert.descriptionText.translation[0].text;

      return {
        routeId,
        trip,
        cause,
        effect,
        activePeriod,
        headerText,
        descriptionText,
      };
    });

    const alertsByRouteId = alerts.reduce((acc: any, alert: any) => {
      const { routeId, trip } = alert;
      const useRouteId = routeId !== '' ? routeId : trip ? trip.routeId : '';

      if (!acc[useRouteId] && useRouteId !== '') {
        acc[useRouteId] = [];
      }
      if (useRouteId && useRouteId !== '') {
        acc[useRouteId].push({
          ...alert,
          routeId: useRouteId,
        });
      }
      return acc;
    }, {});

    await this.cacheManager.set(key, alertsByRouteId, {
      ttl: CacheTtlSeconds.ONE_MINUTE,
    });

    return alertsByRouteId;
  }
}
