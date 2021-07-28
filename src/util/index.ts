/**
 * Get current day of the week (e.g., 'monday', 'tuesday', etc.)
 * @returns {string}
 */
export const getCurrentDay = (): string => {
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const today = daysOfWeek[new Date().getDay()];
  return today;
};

/**
 * Get distance between two points
 * See: https://www.geodatasource.com/developers/javascript
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {string} unit
 * @returns {number} Distance
 */
interface GetDistanceOptions {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
  unit: string;
}
export const getDistance = (props: GetDistanceOptions) => {
  const { lat1, lon1, lat2, lon2, unit } = props;

  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    const radlat1 = Math.PI * lat1/180;
    const radlat2 = Math.PI * lat2/180;
    const theta = lon1-lon2;
    const radtheta = Math.PI * theta/180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }

    return dist;
  }
}
