# transit-app-api

This is the backend companion to `transit-app-next`, providing GTFS data via PostgreSQL/PostGIS and GTFS Realtime endpoints.

This project utilizes NestJS, TypeORM and TypeScript.

## Usage:

Run:
```
npm run start:dev
```

Api is available at `http://localhost:5000/api/v1/`.

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

## Swagger

Swagger is available at:
```
http://localhost:5000/api/v1/docs
```
