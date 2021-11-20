import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeedService } from 'realtime/feed/feed.service';
import {
  FeedMessage,
  FeedEntity,
  Alert,
  EntitySelector,
} from 'realtime/proto/gtfs-realtime';
import {
  IAlert,
  IAlerts,
  IIndexedAlerts,
} from 'realtime/interfaces/alerts.interface';
import { getAlertTranslationText, getConfigByFeedIndex } from 'util/';

@Injectable()
export class AlertsService {
  constructor(
    private readonly feedService: FeedService,
    private readonly configService: ConfigService,
  ) {}

  public async getAlerts(feedIndex): Promise<Alert[]> {
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
    const alerts: Alert[] = entities.map((entity: FeedEntity) => entity.alert);
    return alerts;
  }

  public async getIndexedAlerts(feedIndex: number): Promise<IIndexedAlerts> {
    const alerts: Alert[] = await this.getAlerts(feedIndex);

    const indexedAlerts = alerts.reduce((formattedAlerts, alert: Alert) => {
      const {
        activePeriod,
        informedEntity,
        cause,
        effect,
        headerText,
        descriptionText,
      } = alert;

      informedEntity.forEach((entity: EntitySelector) => {
        const { routeId } = entity;
        if (!formattedAlerts.hasOwnProperty(routeId)) {
          formattedAlerts[routeId] = [];
        }
        formattedAlerts[routeId].push({
          activePeriod,
          cause,
          effect,
          headerText: getAlertTranslationText(headerText, 'en'),
          descriptionText: getAlertTranslationText(descriptionText, 'en'),
        });
      });
      return formattedAlerts;
    }, {});

    return indexedAlerts;
  }

  /* TODO: This method will be removed */
  public async getFormattedAlerts(feedIndex: number): Promise<IAlerts> {
    const alerts: Alert[] = await this.getAlerts(feedIndex);

    const formattedAlerts: IAlert[] = alerts.map((alert: Alert) => {
      const { cause, effect, headerText, descriptionText } = alert;
      const { routeId, trip } = alert.informedEntity[0];
      const activePeriod = alert.activePeriod[0];

      return {
        routeId,
        trip,
        cause,
        effect,
        activePeriod,
        headerText: getAlertTranslationText(headerText, 'en'),
        descriptionText: getAlertTranslationText(descriptionText, 'en'),
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

    return alertsByRouteId;
  }
}
