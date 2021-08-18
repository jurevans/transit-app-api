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

    const entities = feedMessage.entity;
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
      }
    });

    const alertsByRouteId = alerts.reduce((acc: any, alert: any) => {
      const { routeId, trip } = alert;
      let useRouteId = (routeId !== '') ? routeId : trip ? trip.routeId : '';

      if (!acc[useRouteId]) {
        acc[useRouteId] = [];
      }
      if (useRouteId && useRouteId !== '') {
        acc[useRouteId].push(alert);
      }
      return acc;
    }, {});

    await this.cacheManager.set(key, alertsByRouteId, { ttl: CacheTtlSeconds.ONE_MINUTE });
    return alertsByRouteId;
  }
}
