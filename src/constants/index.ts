export enum CacheTtlSeconds {
  THIRTY_SECONDS = 30,
  ONE_MINUTE = 60,
  ONE_HOUR = 60 * 60,
  ONE_DAY = 60 * 60 * 24,
  ONE_WEEK = 7 * 24 * 60 * 60,
  FOREVER = 0,
}

export enum CacheKeyPrefix {
  VEHICLES = 'vehicles',
  TRANSFERS = 'transfers',
  STOPS = 'stops',
}

export enum Intervals {
  GTFS_TRIP_UPDATES = 30000,
}
