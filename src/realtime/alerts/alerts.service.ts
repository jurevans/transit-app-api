import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CacheKeyPrefix, CacheTtlSeconds } from 'constants/';
import { FeedService } from 'realtime/feed/feed.service';
import { IAlert, IAlerts } from 'realtime/interfaces/alerts.interface';
import { FeedMessage, FeedEntity, Alert } from 'realtime/proto/gtfs-realtime';
import {
  formatCacheKey,
  getAlertTranslationText,
  getConfigByFeedIndex,
} from 'util/';

@Injectable()
export class AlertsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly feedService: FeedService,
    private readonly configService: ConfigService,
  ) {}

  /* TODO: This method will be removed */
  public async getFormattedAlerts(feedIndex: number): Promise<IAlerts> {
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

    const feed: FeedMessage = await this.feedService.getFeed({
      feedIndex,
      endpoint: serviceAlertUrl,
    });

    const { entity: entities } = feed;
    const alerts: Alert[] = entities.map((entity: FeedEntity) => entity.alert);

    const formattedAlerts: IAlert[] = alerts.map((alert: Alert) => {
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

    const alertsByRouteId = formattedAlerts.reduce((acc: any, alert: any) => {
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

    return this.cacheManager.get(key);
  }

  public async getAlerts(feedIndex: number): Promise<Alert[]> {
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );

    const { serviceAlertUrl } = config;

    const feed: FeedMessage = await this.feedService.getFeed({
      feedIndex,
      endpoint: serviceAlertUrl,
    });

    const { entity: entities } = feed;
    return <Alert[]>entities.map((entity: FeedEntity) => entity.alert);
  }

  /* TODO: This logic will likely be removed to, and moved into the client */
  public async getIndexedAlerts(feedIndex: number) {
    const alerts = await this.getAlerts(feedIndex);
    const indexedAlerts = alerts.reduce((indexedAlerts, alert: Alert) => {
      const {
        activePeriod,
        informedEntity,
        cause,
        effect,
        headerText,
        descriptionText,
      } = alert;
      informedEntity.forEach((entity: any) => {
        const { routeId } = entity;
        if (!indexedAlerts.hasOwnProperty(routeId)) {
          indexedAlerts[routeId] = [];
        }
        indexedAlerts[routeId].push({
          activePeriod,
          cause,
          effect,
          headerText: getAlertTranslationText(headerText, 'en'),
          descriptionText: getAlertTranslationText(descriptionText, 'en'),
        });
      });
      return indexedAlerts;
    }, {});

    return indexedAlerts;
  }
}
