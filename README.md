# transit-app-api

This is the backend companion to [transit-app-next](https://github.com/jurevans/transit-app-next/), and provides static GTFS data via PostgreSQL/PostGIS, as well as serves JSON endpoints to access GTFS-Realtime data.

This project built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and [TypeScript](https://www.typescriptlang.org/). This project is in its infancy, and should be considered a work-in-progress! There is so much more to do.

The database back-end for `transit-app-api` allows for multiple feeds to be stored simultaneously. A good use case for this would be to serve data for not only subways, but also bus routes/stops, metro trains, ferries, etc. An example of this will eventually be built into this project.

## Usage:

Run:

```bash
npm run start:dev
```

Api is available at `http://localhost:5000/api/v1/`. Swagger documentation is enabled at `http://localhost:5000/api/v1/docs/`, though this is presently minimal while the api is being hashed out. The appropriate decorators from `@nestjs/swagger` will be implemented once this becomes stable.

## Connect to Redis

This application uses Redis for caching and session management, which can be configured in `.env`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_AUTH=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Connect to a database

Example `.env` configuration:

```bash
DB_HOST=<hostname>
DB_PORT=5432
DB_USERNAME=<username>
DB_PASSWORD=<password>
DB_DATABASE=gtfs
```

This project depends on a PostgrSQL database populated using the gtfs-sql-importer: https://github.com/fitnr/gtfs-sql-importer. This requires a PostGIS-enabled PostgreSQL database.

Basic usage is as follows (executed from within the repo):

Export the following environment variables:

```bash
PGDATABASE=mydbname
PGHOST=example.com
PGUSER=username
```

(**NOTE**: You may need to export `PGPASSWORD=password` if not otherwise authenticated to use `psql`).

Then:

```bash
make init
make load GTFS=gtfs.zip
```

Where `gtfs.zip` is the name of the downloaded `.zip` file containing the GTFS data.

## Additional environment configuration:

You will need to configure the GTFS-Realtime endpoint URLs, as well as specify the name of the access key in your `.env` config which corresponds to the value provided by the transit authority to authenticate these requests:

**NOTE**: `routes: []` is optional, and is only used to determine whether we should only request only a particular URL to boost performance. If this parameter is left out, the API will query all provided URLs.

**NOTE**: `proto` is currently unused and may be left out. The intention is that in the future, this API may be able to extend the default `gtfs-realtime.proto` with additional data specific to the transit authority. This is currently not implemented.

```javascript
const gtfsRealtime = [
  {
    feedIndex: 1,
    agencyId: 'MTA NYCT',
    feedUrls: [
      {
        routes: ['1', '2', '3', '4', '5', '6', '7'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
      },
      {
        routes: ['A', 'C', 'E'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
      },
      {
        routes: ['B', 'D', 'F', 'M'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
      },
    ],
    proto: 'nyct-subway',
    accessKey: 'GTFS_REALTIME_ACCESS_KEY',
  },
];
```

Using the above configuration as an example, you would need the following variable defined in a `.env` file:

```bash
GTFS_REALTIME_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

You will need a unique access key for each group of feed endpoints you want to authenticate. In general, you may only have one configuration in here (for this example, we are configuring for the NYC MTA subway system, but we may want to add endpoints for buses as well). These are keyed by the unique `feedIndex` and `agencyId` values found in the agency table (in this example, `1` and `MTA NYCT`).

The `proto` string refers to a complied `.proto` file that is an extension of the base `gtfs-realtime.proto`, in this case, `nyct-subway.proto`. This gets dynamically loaded should it appear in the config, however, making use of the additional bindings it provides is still in the works.

## .proto compiling

If you have the protobuf-compiler installed (`protoc`), and have a specific `.proto` file you wish to use in addition to `gtfs-realtime.proto`, this can be generated as follows:

From the 'proto/' directory:

```bash
npx protoc --plugin=../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./ ./path-to-your.proto
```

`protobufjs` is required to make use of compiled protobufs, and is included in this project's `package.json`.

## Swagger

Swagger is currently available at:

```
http://localhost:5000/api/v1/docs
```

## Endpoints (Work-in-Progress)

### Transit system data:

- `/api/v1/agency/feeds/1`
  - Get agencies by `feedIndex` = `1`
- `/api/v1/location/1`
  - Get center coordinates by `feedIndex` = `1`
- `/api/v1/routes/1`
  - Get all route data by `feedIndex` = `1`
- `/api/v1/routes/1/trips/7`
  - Get trips for route identified by `feedIndex` = `1` and `routeId` = `7`
- `/api/v1/routes/1/id`
  - Get list of all route IDs for `feedIndex` = `1`

### Geographic data:

Note that both stops and shapes can be returned in JSON or GeoJSON. This is to provide data to clients using something like Deck.GL, where a layer (such as `GeoJsonLayer`) might expect a [GeoJSON](https://geojson.org/) object, versus something like `PathLayer` which expects an array of coordinates.

- `/api/v1/geo/1/shapes`
  - Get all route line shapes by `feedIndex` = `1`
- `/api/v1/geo/1/shapes?geojson=true`
  - Same as above, in GeoJSON format (FeatureCollection)
- `/api/v1/geo/1/shapes/GS.N04R`
  - Get GeoJSON LineString geometry identified by `feedIndex` = `1` and `shapeId` = `GS.N04R`
- `/api/v1/geo/1/stops`
  - Get all stops identified by `feedIndex` = `1`
- `/api/v1/geo/1/stops?geojson=true`
  - Same as above, in GeoJSON format (FeatureCollection)
- `/api/v1/geo/1/stops/S09N`
  - Get raw station data identified by `feedIndex` = `1` and `stationId` = `S09N`

### GTFS Real-Time data:

Note that this API also utilizes WebSockets to deliver the following data, but provides the following endpoints for clients that prefer to use a Rest endpoint. The data structure will be identical:

- `/api/v1/realtime/1/alerts`
  - Get all real-time alerts for `feedIndex` = `1`
- `/api/v1/realtime/1/trip-updates/101,102,103,201,301,410`
  - Get all real-time trip-updates for `feedIndex` = `1`, and `stationIds` = `101,102,103,201,301,410`, which is a comma-delimited list of stops (by parent-station ID) for which to receive trip-updates.

## Socket messages:

Your client can subscribe to the following messages to receive Alerts and Trip-Updates:

- `alerts`
  - Begin receiving alerts at 1 minute intervals
- `cancel_alerts`
  - Stop receiving alerts
- `trip_updates`
  - Begin receiving trip-updates at 30 second intervals
- `cancel_trip_updates`
  - Stop receiving trip-updates

Once connected to `alerts` or `trip_updates`, you can subscribe to one of the following to receive data:

`received_trip_updates`, whose data adheres to the following interface:

```javascript
{
  feedIndex: number;
  stationId: string;
  transfers: string[];
  routeIds: string[];
  stopTimeUpdates: IStopTimeUpdate[];
}
```

`received_alerts`:

```javascript
{
  feedIndex: number;
  alerts: IAlert[];
}
```
