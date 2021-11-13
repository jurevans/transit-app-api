export interface IRoute {
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  routeDesc: string;
  routeColor: string | null;
}

export type IRoutes = IRoute[];
