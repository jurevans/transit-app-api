# transit-app-api

This is the backend companion to [transit-app-next](https://github.com/jurevans/transit-app-next/), and provides static GTFS data via PostgreSQL/PostGIS, as well as serves JSON endpoints to access GTFS-Realtime data.

This project built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and [TypeScript](https://www.typescriptlang.org/). This project is in its infancy, and should be considered a work-in-progress! There is so much more to do.

The GTFS-Realtime API endpoints are inspired by [MTAPI](https://github.com/jonthornton/MTAPI/), a Python API that exposes GTFS-Realtime protocol buffers as JSON. While `MTAPI` is specifically serving MTA (NYC) data, it serves as a good example for organizing realtime transit feed responses from a large transit system.

The database that `transit-app-api` uses allows for multiple feeds to be stored simultaneously. A good use case for this would be to serve data for not only subways, but also bus routes/stops, etc. An example of this will eventually be built into this project.

## Usage:

Run:
```bash
npm run start:dev
```

Api is available at `http://localhost:5000/api/v1/`. Swagger documentation is enabled at `http://localhost:5000/api/v1/docs/`, though this is presently minimal while the api is being hashed out. The appropriate decorators from `@nestjs/swagger` will be implemented once this becomes stable.

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
(__NOTE__: You may need to export `PGPASSWORD=password` if not otherwise authenticated to use `psql`).

Then:
```bash
make init
make load GTFS=gtfs.zip
```
Where `gtfs.zip` is the name of the downloaded `.zip` file containing the GTFS data.

## Additional environment configuration:
You will need the following variable defined in a `.env` file:
```bash
GTFS_REALTIME_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The key is used to authenticate requests to the API urls defined in `/config/gtfsRealtime.ts`:
```javascript
const gtfsRealtime = {
  'MTA NYCT': {
    feedUrls: [
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
    ],
    proto: 'nyct-subway',
  }
};
```

These are keyed by the agency ID found in the agency table (in this example, `MTA NYCT`).

The `proto` string refers to a complied `.proto` file that is an extension of the base `gtfs-realtime.proto`, in this case, `nyct-subway.proto`. This gets dynamically loaded should it appear in the config, however, making use of the additional bindings it provides is still in the works.

## .proto compiling
If you have the protobuf-compiler installed (`protoc`), and have a specific `.proto` file you wish to use in addition to `gtfs-realtime.proto`, this can be generated as follows:

From the 'proto/' directory:
```bash
npx protoc --plugin=../node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./ ./path-to-your.proto
```
`protobufjs` is required to make use of compiled protobufs, and is included in this project.

## Swagger
Swagger is currently available at:
```
http://localhost:5000/api/v1/docs
```

## Endpoints (Work-in-Progress)

##### Transit system data:
- `/api/v1/agency/1/id/MTA NYCT`
  - Get agency by `feedIndex` = `1` and `agencyId` = `MTA NYCT`
  - Both of these parameters are required to uniquely identify the correct agency
- `/api/v1/location/1`
  - Get center coordinates by `feedIndex` = `1`
- `/api/v1/routes/1`
  - Get all route data by `feedIndex` = `1`
- `/api/v1/routes/1/id/7X`
  - Get route by ID where `feedIndex` = `1` and `routeId` = `7X`
- `/api/v1/routes/1/trips/7X`
  - Get trips for route identified by `feedIndex` = `1` and `routeId` = `7X`

##### Geographic data:
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

##### GTFS Realtime data:
- `/api/v1/gtfs/1`
  - Get entire GTFS-realtime FeedMessage identified by `feedIndex` `1`
  - __NOTE__: This is an impractical endpoint, and is only here for testing
- `/api/v1/gtfs/1/location?lat=xxx&lon=xxx`
  - __TODO__: Find nearest stations to lat/lon
- `/api/v1/gtfs/1/route/7X`
  - __TODO__: Find all stations by route id `7X`
- `/api/v1/gtfs/1/stations/101N,103N,101S,203N`
  - __TODO__: Find stations by comma-delimited list of station IDs

