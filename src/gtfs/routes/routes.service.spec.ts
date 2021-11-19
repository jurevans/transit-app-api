import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { Routes } from 'entities/routes.entity';
import { Trips } from 'entities/trips.entity';

describe('RoutesService', () => {
  let service: RoutesService;

  const mockRoutesRepository = {};
  const mockTripsRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: getRepositoryToken(Routes),
          useValue: mockRoutesRepository,
        },
        {
          provide: getRepositoryToken(Trips),
          useValue: mockTripsRepository,
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
