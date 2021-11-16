import { Test, TestingModule } from '@nestjs/testing';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { IAgency } from '../interfaces/agency.interface';

describe('AgencyController', () => {
  let controller: AgencyController;

  const mockAgencyService = {
    findAll: jest.fn().mockImplementation((): Promise<IAgency[]> => {
      return Promise.resolve([mockAgency]);
    }),
  };

  const mockAgency: IAgency = {
    feedIndex: 1,
    agencyId: 'MTA NYCT',
    agencyLang: 'en',
    agencyName: 'MTA New York City Transit',
    agencyPhone: '718-330-1234',
    agencyTimezone: 'America/New_York',
    agencyUrl: 'http://www.mta.info',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencyController],
      providers: [AgencyService],
    })
      .overrideProvider(AgencyService)
      .useValue(mockAgencyService)
      .compile();

    controller = module.get<AgencyController>(AgencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a Agency', async () => {
    const feedIndices = ['1'];

    expect(await controller.findOne(feedIndices)).toEqual([
      {
        feedIndex: 1,
        agencyId: expect.any(String),
        agencyLang: expect.any(String),
        agencyName: expect.any(String),
        agencyPhone: expect.any(String),
        agencyTimezone: expect.any(String),
        agencyUrl: expect.any(String),
      },
    ]);

    expect(mockAgencyService.findAll).toHaveBeenCalledWith({ feedIndices });
  });
});
