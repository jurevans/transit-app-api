import { Test, TestingModule } from '@nestjs/testing';
import { GtfsService } from './gtfs.service';

describe('GtfsService', () => {
  let service: GtfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GtfsService],
    }).compile();

    service = module.get<GtfsService>(GtfsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
