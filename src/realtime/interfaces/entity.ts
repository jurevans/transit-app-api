import { ITripUpdate } from './trip-updates';

export interface IEntity {
  id: string;
  isDeleted: boolean;
  tripUpdate?: ITripUpdate;
}
