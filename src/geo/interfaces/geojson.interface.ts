/**
 * Types for GeoJSON data
 */
export type Coordinate = [number, number];

export interface Geometry {
  type: 'LineString' | 'Point' | 'Polygon'; // There are others, but will not likely be used here
  coordinates: Coordinate[];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: {
    id: string;
    name: string;
    longName?: string;
    color?: string;
    description?: string;
    url?: string;
    routeid?: string;
    length?: number;
  };
}

export interface FeatureCollection {
  type: string;
  features: Feature[];
}

// TODO: Aggregation will be removed from the query in the future:
export interface AggregatedPointFeature extends Feature {
  properties: {
    id: string;
    name: string;
    routeIds: string;
    routeNames: string;
    routeLongNames: string;
    routeColors: string;
    routeUrls: string;
  };
}

// TODO: Aggregation will be removed from the query in the future:
export interface AggregatedFeatureCollection extends FeatureCollection {
  features: AggregatedPointFeature[];
}
