import { registerAs } from '@nestjs/config';

export default registerAs('gtfs-realtime', () => [
  {
    feedIndex: 1,
    agencyId: 'MTA NYCT',
    feedUrls: [
      {
        routes: ['1', '2', '3', '4', '5', '6', '7', 'GS'],
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
      {
        routes: ['G'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
      },
      {
        routes: ['J', 'Z'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
      },
      {
        routes: ['N', 'Q', 'R', 'W'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
      },
      {
        routes: ['L'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
      },
      {
        routes: ['SI'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',
      },
      {
        alert: true,
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts',
      },
    ],
    proto: 'nyct-subway',
    // Specify any differences between static and RT routeIds here:
    // Key = GTFS Realtime Route ID, Value = GTFS Static Route ID
    routeIdOverrides: {
      // Example: routeShortName -> routeId
      SIR: 'SI',
      S: 'GS',
      SS: 'FS',
    },
    routeTypeOverrides: {
      '1': 'Subway',
    },
    // Name of access key to load from .env
    accessKey: 'GTFS_REALTIME_ACCESS_KEY',
    // Service alerts associated with this feed:
    serviceAlertUrl:
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts',
    serviceAlertProto: 'gtfs-realtime-service-status',
  },
]);
