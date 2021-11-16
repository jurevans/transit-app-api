import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import * as GTFS from '../../../proto/gtfs-realtime';
import { getConfigByFeedIndex } from 'util/';
import { IRealtimeFeed } from '../interfaces/feed.interface';

@Injectable()
export class FeedService {
  constructor(private readonly configService: ConfigService) {}

  public async getFeed(props: {
    feedIndex: number;
    endpoint: string;
  }): Promise<IRealtimeFeed> {
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
    const feedMessage = GTFS.FeedMessage.decode(buffer);

    return <IRealtimeFeed>GTFS.FeedMessage.toJSON(feedMessage);
  }
}
