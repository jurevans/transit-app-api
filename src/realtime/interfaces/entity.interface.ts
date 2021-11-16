import { ITripUpdate } from './trip-updates.interface';

export interface IEntity {
  id: string;
  isDeleted: boolean;
  tripUpdate?: ITripUpdate;
}
