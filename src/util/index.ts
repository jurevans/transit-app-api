import { ConfigService } from '@nestjs/config';
import { IEndpoint } from 'realtime/interfaces/endpoint.interface';
import {
  FeedEntity,
  FeedMessage,
  TranslatedString,
} from 'realtime/proto/gtfs-realtime';

/**
 * Get current day of the week (e.g., 'monday', 'tuesday', etc.)
 * @returns {string}
 */
export const getCurrentDay = (): string => {
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const today = daysOfWeek[new Date().getDay()];
  return today;
};

export type Coordinate = [number, number];

/**
 * Get distance between two points
 * See: https://www.geodatasource.com/developers/javascript
 * @param {Coordinate} coord1
 * @param {Coordinate} coord2
 * @returns {number} Distance
 */
export const getDistance = (
  coord1: Coordinate,
  coord2: Coordinate,
  unit?: string,
): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }

    return dist;
  }
};

/**
 * Format key
 * @param keyPrefix
 * @param value
 * @returns {string}
 */
export const formatCacheKey = (
  keyPrefix: string,
  value: string | number,
): string => `/${keyPrefix}/${value}`;

/**
 * Get config from ConfigService
 * @param configService
 * @param configKey
 * @param feedIndex
 * @returns {config}
 */
export const getConfigByFeedIndex: any = (
  configService: ConfigService,
  configKey: string,
  feedIndex: number,
) => {
  return configService
    .get(configKey)
    .find((config: any) => config.feedIndex === feedIndex);
};

/**
 * Return translated text from Alerts
 * @param translated
 * @param language
 * @returns {string}
 */
export const getAlertTranslationText = (
  translated: TranslatedString,
  language: string,
): string => {
  const { translation } = translated;
  const textTranslation = translation.find(
    (translation: any) => translation.language === language,
  );
  if (textTranslation) {
    const { text } = textTranslation;
    return text;
  }
  return '';
};

/**
 * Return FeedEntities specified by type
 * @param feedMessage
 * @param type
 * @returns {FeedEntity[]}
 */
export const getFeedEntitiesByType = (
  feedMessage: FeedMessage,
  type: string,
): FeedEntity[] => {
  return feedMessage.entity.filter((entity: FeedEntity) =>
    entity.hasOwnProperty(type),
  );
};

/**
 * Get array of URLs based on routeIds. If no routeIds provided, return all route URLs
 * @param feedUrls
 * @param routeIds
 * @returns {string[]}
 */
export const getUrlsByRouteIds = (
  feedUrls: IEndpoint[],
  routeIds: string[],
): string[] => {
  const endpoints = routeIds
    ? feedUrls.filter((endpoint: IEndpoint) => {
        if (routeIds.length > 0 && endpoint.hasOwnProperty('routes')) {
          if (endpoint.routes.some) {
            return endpoint.routes.some(
              (route: string) => routeIds.indexOf(route) > -1,
            );
          }
          return false;
        }
        return !!endpoint.routes;
      })
    : feedUrls;

  return endpoints.map((endpoint: IEndpoint) => endpoint.url);
};

/**
 * Get array of URLs for service alerts
 * @param feedUrls
 * @returns {string[]}
 */
export const getAlertUrls = (feedUrls: IEndpoint[]): string[] =>
  feedUrls
    .filter((endpoint: IEndpoint) => endpoint.alert === true)
    .map((endpoint: IEndpoint) => endpoint.url);
