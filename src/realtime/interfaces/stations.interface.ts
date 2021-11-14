/**
 * Station interfaces:
 * NOTE: A "Station" is essentially a stop and its related transfers.
 */
export interface IIndexedStop {
  stopId: string;
  parentStation: string;
  headsign: string;
  tripId: string;
  routeId: string;
  directionId: number;
  time: number;
}

export interface IIndexedStops {
  [key: string]: IIndexedStop;
}

export type ITransfer = string;

export interface ITransfers {
  [key: string]: ITransfer[];
}
