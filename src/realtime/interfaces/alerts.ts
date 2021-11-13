export interface IAlert {
  routeId: string;
  trip: unknown;
  cause: string;
  effect: string;
  activePeriod: any;
  headerText: string;
  descriptionText: string;
}

export interface IAlerts {
  [key: string]: IAlert[];
}
