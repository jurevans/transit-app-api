/**
 * Configure API endpoints, keyed by feedIndex, agencyId
 */
const gtfsRealtime = {
  '1': {
    'MTA NYCT': {
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
      proto: 'nyct-subway',
      // Specify any differences between static and RT routeIds here:
      // Key = GTFS Realtime Route ID, Value = GTFS Static Route ID
      routeIdOverrides: {
        'SIR': 'SI',
        'S': 'GS',
        'SS': 'FS',
      },
    },
  },
};

export default gtfsRealtime;
