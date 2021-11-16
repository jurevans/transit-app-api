import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { FeedInfo } from 'entities/feedInfo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('FeedService', () => {
  let service: FeedService;

  const mockFeedRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: getRepositoryToken(FeedInfo),
          useValue: mockFeedRepository,
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
