import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agency } from 'entities/agency.entity';
import { IAgency } from 'gtfs/interfaces/agency.interface';
import { AgencyService } from './agency.service';

describe('AgencyService', () => {
  let service: AgencyService;

  const mockAgencyRepository = {
    find: jest.fn().mockImplementation((): Promise<IAgency[]> => {
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
      providers: [
        AgencyService,
        {
          provide: getRepositoryToken(Agency),
          useValue: mockAgencyRepository,
        },
      ],
    }).compile();

    service = module.get<AgencyService>(AgencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of Agencies', async () => {
    const feedIndicesProps = {
      feedIndices: ['1'],
    };

    expect(await service.findAll(feedIndicesProps)).toEqual([
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
  });
});
