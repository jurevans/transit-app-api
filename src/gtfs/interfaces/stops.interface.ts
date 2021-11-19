export interface IStop {
  stopId: string;
  parentStation: string;
  headsign: string;
  tripId: string;
  routeId: string;
  directionId: number;
  time: number;
}

export interface IParentStation {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
  stops: {
    [key: string]: IStop;
  };
}
