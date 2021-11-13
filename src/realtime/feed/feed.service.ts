import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import * as GTFS from 'proto/gtfs-realtime';
import { IFeed } from '../interfaces/feed';

@Injectable()
export class FeedService {
  constructor(private readonly configService: ConfigService) {}

  public getConfig(feedIndex: number) {
    return this.configService
      .get('gtfs-realtime')
      .find((config: any) => config.feedIndex === feedIndex);
  }

  public async getFeed(props: {
    feedIndex: number;
    endpoint: string;
  }): Promise<IFeed> {
    const { feedIndex, endpoint } = props;
    const { accessKey } = this.getConfig(feedIndex);
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

    return <IFeed>GTFS.FeedMessage.toJSON(feedMessage);
  }
}
