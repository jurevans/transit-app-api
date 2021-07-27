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
