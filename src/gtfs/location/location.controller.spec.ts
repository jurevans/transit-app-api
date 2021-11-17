import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { ILocation } from '../interfaces/location.interface';

describe('LocationController', () => {
  let controller: LocationController;

  type Props = {
    feedIndex: number;
  };

  const mockLocationService = {
    findLocation: jest
      .fn()
      .mockImplementation((props: Props): Promise<ILocation> => {
        const { feedIndex } = props;
        if (!feedIndex) {
          return Promise.reject();
        }
        return Promise.resolve(mockLocation);
      }),
  };

  const mockLocation = {
    longitude: -73.94594865587045,
    latitude: 40.7227534777328,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [LocationService],
    })
      .overrideProvider(LocationService)
      .useValue(mockLocationService)
      .compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a Feed', async () => {
    const feedIndex = 1;

    expect(await controller.findLocation(feedIndex)).toEqual({
      longitude: expect.any(Number),
      latitude: expect.any(Number),
    });

    expect(mockLocationService.findLocation).toHaveBeenCalledWith({
      feedIndex,
    });
  });
});
