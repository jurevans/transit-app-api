import { Test, TestingModule } from '@nestjs/testing';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { IAgency } from '../interfaces/agency.interface';

describe('AgencyController', () => {
  let controller: AgencyController;

  const feedIndices = ['1'];
  const mockAgency: IAgency = {
    feedIndex: 1,
    agencyId: 'MTA NYCT',
    agencyLang: 'en',
    agencyName: 'MTA New York City Transit',
    agencyPhone: '718-330-1234',
    agencyTimezone: 'America/New_York',
    agencyUrl: 'http://www.mta.info',
  };

  const MockAgencyService = {
    findAll: jest.fn(() => {
      return mockAgency;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencyController],
      providers: [AgencyService],
    })
      .overrideProvider(AgencyService)
      .useValue(MockAgencyService)
      .compile();

    controller = module.get<AgencyController>(AgencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a Agency', () => {
    expect(controller.findOne(feedIndices)).toEqual(mockAgency);
  });
});
