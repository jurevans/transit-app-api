import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { IStaticFeed } from '../interfaces/feed.interface';

describe('FeedController', () => {
  let controller: FeedController;

  type Props = {
    feedIndex: number;
  };

  const mockFeedService = {
    findOne: jest
      .fn()
      .mockImplementation((props: Props): Promise<IStaticFeed> => {
        const { feedIndex } = props;
        if (!feedIndex) {
          return Promise.reject();
        }
        return Promise.resolve(mockFeed);
      }),
    findAll: jest.fn().mockImplementation((): Promise<IStaticFeed[]> => {
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
      controllers: [FeedController],
      providers: [FeedService],
    })
      .overrideProvider(FeedService)
      .useValue(mockFeedService)
      .compile();

    controller = module.get<FeedController>(FeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a Feed', async () => {
    const feedIndex = 1;
    const props: Props = { feedIndex };

    expect(await controller.findOne(feedIndex)).toEqual({
      feedIndex: 1,
      feedStartDate: expect.any(String),
      feedEndDate: expect.any(String),
    });

    expect(mockFeedService.findOne).toHaveBeenCalledWith(props);
  });

  it('should return all Feeds', async () => {
    expect(await controller.findAll()).toEqual([
      {
        feedIndex: 1,
        feedStartDate: expect.any(String),
        feedEndDate: expect.any(String),
      },
    ]);

    expect(mockFeedService.findAll).toHaveBeenCalledWith();
  });
});
