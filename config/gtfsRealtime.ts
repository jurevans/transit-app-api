/**
 * Configure API endpoints, keyed by feedIndex, agencyId
 */
const gtfsRealtime = [
  {
    feedIndex: 1,
    agencyId: 'MTA NYCT',
    feedUrls: [
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',       // 1,2,3,4,5,6,S
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',   // A,C,E
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',  // B,D,F,M
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',     // G
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',    // J,Z
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',  // N,Q,R,W
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',     // L
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',    // SIR
    ],
    // Test config, to allow requests for specific routes, as an alternative
    // to the above. Note: It isn't a requirement that endpoints are grouped
    // like this, other transit agencies or services may provide only a single
    // endpoint, so the above config should still be valid!
    feedUrls2: [
      {
        routes: ['1', '2', '3', '4', '5', '6', 'GS'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
      },
      {
        type: 'route',
        routes: ['A', 'C', 'E'],
        url: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
      },
      {
        type: 'route',
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
    ],
    proto: 'nyct-subway',
    // Specify any differences between static and RT routeIds here:
    // Key = GTFS Realtime Route ID, Value = GTFS Static Route ID
    routeIdOverrides: {
      'SIR': 'SI',
      'S': 'GS',
      'SS': 'FS',
    },
    // Name of access key to load from .env
    accessKey: 'GTFS_REALTIME_ACCESS_KEY',
    // Service alerts associated with this feed:
    serviceAlertUrls: [
      'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts',
      // JSON:
      // https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json
    ],
    serviceAlertProto: 'gtfs-realtime-service-status',
  },
];

export default gtfsRealtime;
