import {
  Alert,
  Alert_Cause,
  Alert_Effect,
  TripDescriptor,
} from 'realtime/proto/gtfs-realtime';

export interface IAlert {
  routeId: string;
  trip: TripDescriptor;
  cause: Alert_Cause;
  effect: Alert_Effect;
  activePeriod: any;
  headerText: string;
  descriptionText: string;
}

export interface IIndexedAlerts {
  [key: string]: Alert;
}

export interface IAlerts {
  [key: string]: IAlert[];
}
