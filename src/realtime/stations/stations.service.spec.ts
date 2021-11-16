import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { StationsService } from './stations.service';
import { Stops } from 'entities/stops.entity';
import { Transfers } from 'entities/transfers.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('StationsService', () => {
  let service: StationsService;

  const mockStopsRepository = {};
  const mockTransfersRepository = {};
  const mockCacheManager = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StationsService,
        {
          provide: getRepositoryToken(Stops),
          useValue: mockStopsRepository,
        },
        {
          provide: getRepositoryToken(Transfers),
          useValue: mockTransfersRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<StationsService>(StationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
