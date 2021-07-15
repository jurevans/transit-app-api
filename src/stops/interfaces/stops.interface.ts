/* TODO: This probably isn't needed - the entity should have an interface we can use */
export interface Stops {
  feedIndex: number;
  stopId: string;
  stopName: string | null;
  stopDesc: string | null;
  stopLat: number | null;
  stopLon: number | null;
  zoneId: number | null;
  stopUrl: string | null;
  stopStreet: string | null;
  stopCity: string | null;
  stopRegion: string | null;
  stopTimezone: string | null;
  direction: string | null;
  position: string | null;
  parentStation: string | null;
  vehicleType: number | null;
  platformCode: string | null;
  theGeom: string | null;
}