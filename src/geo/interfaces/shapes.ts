export interface IShape {
  length: string;
  routeId: string;
  name: string;
  longName: string;
  url: string;
  id: string | null;
  theGeom: string;
}

export type IShapes = IShape[];
