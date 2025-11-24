// Geofencing utility functions

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if a coordinate is within a circular geofence
export const isWithinGeofence = (
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radius: number
): boolean => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  return distance <= radius;
};

// Find the closest location from a list of coordinates
export const findClosestLocation = (
  lat: number,
  lon: number,
  locations: Array<{ id: string; latitude: number; longitude: number; radius: number }>
): { id: string; distance: number; withinGeofence: boolean } | null => {
  if (locations.length === 0) return null;

  let closestLocation = null;
  let minDistance = Infinity;

  for (const location of locations) {
    const distance = calculateDistance(
      lat,
      lon,
      location.latitude,
      location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = {
        id: location.id,
        distance,
        withinGeofence: distance <= location.radius
      };
    }
  }

  return closestLocation;
};