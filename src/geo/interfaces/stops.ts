export interface IStop {
  routeIds: string;
  routeNames: string;
  routeLongNames: string;
  routeColors: string | null;
  name: string;
  the_geom: string;
}

export type IStops = IStop[];
