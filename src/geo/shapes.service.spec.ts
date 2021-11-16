import { Test, TestingModule } from '@nestjs/testing';
import { ShapesService } from './shapes.service';
import { ShapeGeoms } from 'entities/shapeGeoms.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ShapesService', () => {
  let service: ShapesService;

  const mockShapesRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShapesService,
        {
          provide: getRepositoryToken(ShapeGeoms),
          useValue: mockShapesRepository,
        },
      ],
    }).compile();

    service = module.get<ShapesService>(ShapesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
