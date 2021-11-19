import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from './realtime.gateway';
import { AlertsService } from './alerts/alerts.service';
import { TripUpdatesService } from './trip-updates/trip-updates.service';
import { StationsService } from './stations/stations.service';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;

  const mockAlertsService = {};
  const mockTripUpdatesService = {};
  const mockStationsService = {};
  const mockSchedulerRegistry = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
        {
          provide: TripUpdatesService,
          useValue: mockTripUpdatesService,
        },
        {
          provide: StationsService,
          useValue: mockStationsService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
