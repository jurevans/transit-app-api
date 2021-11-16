import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StopsService } from './stops.service';
import { Stops } from 'entities/stops.entity';

describe('StopsService', () => {
  let service: StopsService;

  const mockStopsRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StopsService,
        {
          provide: getRepositoryToken(Stops),
          useValue: mockStopsRepository,
        },
      ],
    }).compile();

    service = module.get<StopsService>(StopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
