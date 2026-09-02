/**
 * Geolocation & Geofencing Utilities
 * 
 * SYSTEM SECURITY NOTICE:
 * Client-reported browser geolocation is validated with accuracy thresholds.
 * Uses browser navigator.geolocation and Haversine formula for geofence verification.
 * In a real production system, server-side cross-checks (IP geolocation, BLE beacons, cellular tower verification)
 * are required for tamper-resistant attendance compliance.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates Great-Circle distance between two coordinates in meters using Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if a coordinate is within a given radius of a center coordinate
 */
export function isPointInsideGeofence(
  point: Coordinates,
  center: Coordinates,
  radiusMeters: number
): boolean {
  const dist = calculateHaversineDistance(point, center);
  return dist <= radiusMeters;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats meter distance nicely (e.g. "45 m", "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Retrieves client geolocation with promise wrapper and error handling
 */
export async function getCurrentBrowserLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 15),
        });
      },
      (error) => {
        let msg = 'Unable to fetch location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
