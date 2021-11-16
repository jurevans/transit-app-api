/**
 * Types for GeoJSON data
 */
export type Coordinate = [number, number];

export interface LineString {
  type: 'LineString';
  coordinates: Coordinate[];
}

export interface Geometry {
  type: 'LineString' | 'Point' | 'Polygon'; // There are others, but will not likely be used here
  coordinates: Coordinate[];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: {
    name: string;
    color?: string;
    description?: string;
    url?: string;
    id?: string;
    routeid?: string;
  };
}

export interface FeatureCollection {
  type: string;
  features: Feature[];
}
