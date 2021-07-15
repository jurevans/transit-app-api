# transit-app-api

This is the backend companion to `transit-app-next`, providing GTFS data via PostgreSQL/PostGIS and GTFS Realtime endpoints.

This project utilizes NestJS, TypeORM and TypeScript.

Example `.env.local` configuration:

```
DB_TYPE=postgres
DB_HOST=<hostname>
DB_PORT=5432
DB_USERNAME=<username>
DB_PASSWORD=<password>
DB_DATABASE=gtfs
DB_SCHEMA=gtfs
```
