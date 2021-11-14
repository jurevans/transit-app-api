export interface IArrivalDeparture {
  delay: number;
  time: number;
  uncertainty: number;
}

export interface IStopTimeUpdate {
  stopSequence: number;
  stopId: string;
  scheduleRelationship: number;
  arrival: IArrivalDeparture;
  departure: IArrivalDeparture;
}

export interface ITrip {
  tripId: string;
  routeId: string;
  directionId: number;
  startTime: string;
  startDate: string;
  scheduleRelationship: number;
}

export interface ITripUpdate {
  timestamp: number;
  delay: number;
  stopTimeUpdate: IStopTimeUpdate[];
  trip: ITrip;
}

export interface IEndpoint {
  routes?: string[];
  url: string;
}
