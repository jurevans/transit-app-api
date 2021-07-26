import { Test, TestingModule } from '@nestjs/testing';
import { GtfsController } from './gtfs.controller';

describe('GtfsController', () => {
  let controller: GtfsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GtfsController],
    }).compile();

    controller = module.get<GtfsController>(GtfsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
