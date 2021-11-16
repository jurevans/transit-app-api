import { Test, TestingModule } from '@nestjs/testing';
import { StopsController } from './stops.controller';
import { StopsService } from './stops.service';

describe('StopsController', () => {
  let controller: StopsController;

  const mockStopsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StopsController],
      providers: [StopsService],
    })
      .overrideProvider(StopsService)
      .useValue(mockStopsService)
      .compile();

    controller = module.get<StopsController>(StopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
