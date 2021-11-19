import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { ILocation } from '../interfaces/location.interface';
import { EntityManager } from 'typeorm';

describe('LocationService', () => {
  let service: LocationService;

  type Props = {
    feedIndex: number;
  };

  const mockEntityManager = {
    query: jest.fn().mockImplementation(async (): Promise<ILocation[]> => {
      return Promise.resolve([mockLocation]);
    }),
  };

  const mockLocation: ILocation = {
    longitude: -73.94594865587045,
    latitude: 40.7227534777328,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a location', async () => {
    const props: Props = {
      feedIndex: 1,
    };

    expect(await service.findLocation(props)).toEqual({
      longitude: expect.any(Number),
      latitude: expect.any(Number),
    });
  });
});
