import { IEntity } from './entity';

export interface IFeed {
  entity: IEntity[];
  header: {
    gtfsRealtimeVersion: string;
    incrementality: number;
    timestamp: number;
  };
}
