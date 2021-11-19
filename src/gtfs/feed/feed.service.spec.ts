import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { FeedInfo } from 'entities/feedInfo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IStaticFeed } from '../interfaces/feed.interface';

describe('FeedService', () => {
  let service: FeedService;

  const mockFeedRepository = {
    findOneOrFail: jest.fn().mockImplementation((): Promise<IStaticFeed> => {
      return Promise.resolve(mockFeed);
    }),
    find: jest.fn().mockImplementation((): Promise<IStaticFeed[]> => {
      return Promise.resolve([mockFeed]);
    }),
  };

  const mockFeed: IStaticFeed = {
    feedIndex: 1,
    feedStartDate: '2021-06-27',
    feedEndDate: '2021-07-24',
  };

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

  it('should return an array of Feeds', async () => {
    expect(await service.findAll()).toEqual([
      {
        feedIndex: 1,
        feedStartDate: expect.any(String),
        feedEndDate: expect.any(String),
      },
    ]);
  });

  it('should return a Feed', async () => {
    const feedIndexProps = {
      feedIndex: 1,
    };

    expect(await service.findOne(feedIndexProps)).toEqual({
      feedIndex: 1,
      feedStartDate: expect.any(String),
      feedEndDate: expect.any(String),
    });
  });
});
