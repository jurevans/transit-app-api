import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TripUpdatesService } from './trip-updates.service';
import { StationsService } from '../stations/stations.service';
import { FeedService } from '../feed/feed.service';

describe('TripUpdatesService', () => {
  let service: TripUpdatesService;

  const mockStationsService = {};
  const mockFeedService = {};
  const mockConfigService = {};
  const mockCacheManager = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripUpdatesService,
        {
          provide: StationsService,
          useValue: mockStationsService,
        },
        {
          provide: FeedService,
          useValue: mockFeedService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TripUpdatesService>(TripUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
