/**
 * Types for raw data
 */
export interface ShapeRawDataItem {
  length: string;
  routeId: string;
  name: string;
  longName: string;
  url: string;
  id: string | null;
  theGeom: string;
}

export type ShapeRawData = ShapeRawDataItem[];

export interface StopRawDataItem {
  routeIds: string;
  routeNames: string;
  routeLongNames: string;
  routeColors: string | null;
  name: string;
  the_geom: string;
}

export type StopRawData = StopRawDataItem[];

export interface RouteRawDataItem {
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  routeDesc: string;
  routeColor: string | null;
}

export type RouteRawData = RouteRawDataItem[];
