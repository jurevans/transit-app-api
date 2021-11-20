/**
 * NOTE!!! This file is a new implementation in the works
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { Alert, FeedEntity, FeedMessage } from 'realtime/proto/gtfs-realtime';
import {
  getConfigByFeedIndex,
  getFeedEntitiesByType,
  getUrlsByRouteIds,
} from 'util/';

@Injectable()
export class RealtimeService {
  constructor(private readonly configService: ConfigService) {}

  private async _getFeedMessage(props: {
    feedIndex: number;
    endpoint: string;
  }): Promise<FeedMessage> {
    const { feedIndex, endpoint } = props;
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );
    const { accessKey } = config;
    const accessKeyValue = this.configService.get(accessKey);
    const options = {
      method: 'GET',
      headers: {
        'x-api-key': accessKeyValue,
      },
    };

    const response = await fetch(endpoint, options);
    const buffer = await response.buffer();
    const feedMessage = FeedMessage.decode(buffer);

    return <FeedMessage>FeedMessage.toJSON(feedMessage);
  }

  public async getAlerts(feedIndex: number): Promise<Alert[]> {
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );

    const { serviceAlertUrl } = config;

    const feed: FeedMessage = await this._getFeedMessage({
      feedIndex,
      endpoint: serviceAlertUrl,
    });

    const { entity: entities } = feed;

    return <Alert[]>entities.map((entity: FeedEntity) => entity.alert);
  }

  public async getTripUpdates(props: {
    feedIndex: number;
    routeIds: string[];
  }): Promise<FeedEntity[]> {
    const { feedIndex, routeIds } = props;
    const feedMessages = await this._getFeedMessagesByRouteIds(
      feedIndex,
      routeIds,
    );

    const tripUpdates = feedMessages
      .map((feedMessage: FeedMessage) => {
        return getFeedEntitiesByType(feedMessage, 'tripUpdate');
      })
      .flat();

    return <FeedEntity[]>tripUpdates;
  }

  private async _getFeedMessagesByRouteIds(
    feedIndex: number,
    routeIds?: string[],
  ): Promise<FeedMessage[]> {
    const config = getConfigByFeedIndex(
      this.configService,
      'gtfs-realtime',
      feedIndex,
    );
    const { feedUrls } = config;
    // Which of these URLs should I use?
    const urls = getUrlsByRouteIds(feedUrls, routeIds);
    console.log({ urls });
    return Promise.all(
      urls.map(
        async (endpoint: string) => <FeedMessage>await this._getFeedMessage({
            feedIndex,
            endpoint,
          }),
      ),
    );
  }
}
