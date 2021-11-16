import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    const mockResponse = JSON.stringify({
      name: 'GTFS API',
      url: 'https://github.com/jurevans/transit-app-api/',
    });

    it('should return "GTFS API"', () => {
      expect(appController.getIndex()).toEqual(mockResponse);
    });
  });
});
