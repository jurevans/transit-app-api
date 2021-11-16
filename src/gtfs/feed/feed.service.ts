import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedInfo } from 'entities/feedInfo.entity';
import { IStaticFeed } from '../interfaces/feed.interface';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedInfo)
    private feedInfoRepository: Repository<FeedInfo>,
  ) {}

  findAll(): Promise<IStaticFeed[]> {
    return this.feedInfoRepository.find({
      select: ['feedIndex', 'feedStartDate', 'feedEndDate'],
    });
  }

  findOne(props: { feedIndex: number }): Promise<IStaticFeed> {
    const { feedIndex } = props;
    return this.feedInfoRepository.findOneOrFail({ feedIndex });
  }
}
