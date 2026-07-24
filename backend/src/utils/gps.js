const isValidCoordinate = (lat, lng) => {
  const isLat = lat >= -90 && lat <= 90;
  const isLng = lng >= -180 && lng <= 180;
  return isLat && isLng;
};

// Haversine formula to find distance in kilometers between two GPS coordinates
const getDistanceKM = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

module.exports = {
  isValidCoordinate,
  getDistanceKM,
};
