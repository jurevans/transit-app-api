import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedInfo } from 'src/entities/feedInfo.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedInfo)
    private feedInfoRepository: Repository<FeedInfo>,
  ) {}

  find() {
    return this.feedInfoRepository.find({
      select: ['feedIndex', 'feedStartDate', 'feedEndDate'],
    });
  }

  findOne(props: { feedIndex: number }) {
    const { feedIndex } = props;
    return this.feedInfoRepository.findOneOrFail({ feedIndex });
  }
}
