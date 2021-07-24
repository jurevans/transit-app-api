# transit-app-api

This is the backend companion to [transit-app-next](https://github.com/jurevans/transit-app-next/), and provides GTFS data via PostgreSQL/PostGIS, and will soon serve JSON endpoints to access GTFS-Realtime data.

This project built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and [TypeScript](https://www.typescriptlang.org/). This project is in its infancy, and should be considered a work-in-progress! There is so much more to do.

## Usage:

Run:
```
npm run start:dev
```

Api is available at `http://localhost:5000/api/v1/`. Swagger documentation is enabled at `http://localhost:5000/api/v1/docs/`, though this is presently minimal while the api is being hashed out. The appropriate decorators from `@nestjs/swagger` will be implemented once this becomes stable.

## Connect to a database
Example `.env.local` configuration:

```
DB_HOST=<hostname>
DB_PORT=5432
DB_USERNAME=<username>
DB_PASSWORD=<password>
DB_DATABASE=gtfs
```

This project depends on a PostgrSQL database populated using the gtfs-sql-importer: https://github.com/fitnr/gtfs-sql-importer. This requires a PostGIS-enabled PostgreSQL database.

Basic usage is as follows (executed from within the repo):

Export the following environment variables:
```
PGDATABASE=mydbname
PGHOST=example.com
PGUSER=username
```
(_NOTE_: You may need to export `PGPASSWORD=password` if not otherwise authenticated to use `psql`).

Then:
```
make init
make load GTFS=gtfs.zip
```
Where `gtfs.zip` is the name of the downloaded `.zip` file containing the GTFS data.

## Additional environment configuration:
You will need the following variables defined in a `.env.local` file:
```
POSITION_STACK_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
REALTIME_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
This API currently performs a Geocoding lookup using [positionstack](https://positionstack.com/) to retrieve the coordinates of the transit agency specified in the `agency` table. This gives the client application the coordinates it needs to initially center the map. I'm considering removing this as a requirement, and using the geo-location of the GTFS stops to find a good default coordinate to provide the client, with the option of providing a specific coordinate on the client app should the user want a different initial starting point.

The `REALTIME_ACCESS_KEY` is not currently used, but will be required in order to make any requests to a GTFS-realtime endpoint. A different configuration model may be needed in the event that the user wants to serve more than one feed from the database, such that different transit authorities are available with different endpoints for realtime data. The goal of this project is to be as agnostic as is possible.

## Swagger
Swagger is currently available at:
```
http://localhost:5000/api/v1/docs
```

## TODO
There is too much to list here, but a few items include:
- When real-time updates are implemented, the user should be able to specify a `.proto` file that inherits `gtfs-realtime.proto`, as does the included `proto/nyct-subway.proto` file.
- This API should easily serve multiple feeds meaning requests should probably require a feed index to delineate the feeds. This feed "index" is automatically generated when the `gtfs-sql-importer` is run, but currently is not being used.
- An initial migration should be run to generate the optimized route-shape data used by the map application. Presently, `src/shapes/shapes.service.ts` is running a rather large query that attempts to retrieve the most "complete" versions of the routes geometries based on the number of stations served by a trip. These geometries should be stored in their own dataset, once, then queried and cached by the client. Alternatively, a one-time SQL script may be created that serves this purpose, perhaps.
- Currently, the `/api/v1/shapes` endpoint accepts an optional `?geojson=true` parameter, serving the data in GeoJSON format, using `Feature` and `FeatureCollection` generated in PostGIS. This will be implemented for the `/api/v1/stops` endpoint as well, and the client will be updated to expect GeoJSON data for stop location geometries and properties.
