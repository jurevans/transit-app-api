import { Test, TestingModule } from '@nestjs/testing';
import { GeoController } from './geo.controller';
import { ShapesService } from './shapes.service';
import { StopsService } from './stops.service';

describe('GeoController', () => {
  let controller: GeoController;

  const mockShapesService = {};
  const mockStopsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [
        {
          provide: ShapesService,
          useValue: mockShapesService,
        },
        {
          provide: StopsService,
          useValue: mockStopsService,
        },
      ],
    }).compile();

    controller = module.get<GeoController>(GeoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
