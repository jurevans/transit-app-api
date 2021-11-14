import { IEntity } from './entity.interface';

export interface IRealtimeFeed {
  entity: IEntity[];
  header: {
    gtfsRealtimeVersion: string;
    incrementality: number;
    timestamp: number;
  };
}
