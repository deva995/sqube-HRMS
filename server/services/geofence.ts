import { GeofenceLocation } from '../../src/types';
import { AppError } from '../types';

export interface GeofenceVerificationResult {
  withinGeofence: boolean;
  distanceMeters: number;
  matchedGeofence?: GeofenceLocation;
  verifiedAt: string;
  statusText: string;
  policyVerdict: 'Allowed' | 'Allowed with Warning' | 'Approval Required' | 'Blocked';
  isSpoofSuspected: boolean;
}

/**
 * Computes authoritative great-circle distance between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 10) / 10; // 1 decimal precision
}

/**
 * Validates timestamp sanity to prevent replay or spoofed timestamp attacks
 */
export function validateTimestampSanity(clientTimestamp: string | number, maxDriftMinutes: number = 5): boolean {
  const clientTime = new Date(clientTimestamp).getTime();
  const serverTime = Date.now();
  const diffMs = Math.abs(serverTime - clientTime);
  const maxAllowedDiffMs = maxDriftMinutes * 60 * 1000;

  return diffMs <= maxAllowedDiffMs;
}

/**
 * Authoritative Geofence Verifier
 */
export function verifyGeofencePunch(
  clientLat: number,
  clientLon: number,
  clientAccuracy: number,
  clientTimestamp: string,
  orgGeofences: GeofenceLocation[]
): GeofenceVerificationResult {
  // 1. Sanity Check on Timestamp
  const isTimestampValid = validateTimestampSanity(clientTimestamp, 5);
  if (!isTimestampValid) {
    throw new AppError(
      'Clock-in timestamp rejected: Client device clock drifts more than 5 minutes from authoritative server time.',
      400,
      'TIMESTAMP_DRIFT_DETECTED'
    );
  }

  // 2. Fallback if no geofences configured
  if (!orgGeofences || orgGeofences.length === 0) {
    return {
      withinGeofence: true,
      distanceMeters: 0,
      verifiedAt: new Date().toISOString(),
      statusText: 'No Geofence Enforced for Organization',
      policyVerdict: 'Allowed',
      isSpoofSuspected: false,
    };
  }

  // 3. Find closest geofence
  let closestGeofence: GeofenceLocation = orgGeofences[0];
  let minDistance = calculateHaversineDistanceMeters(
    clientLat,
    clientLon,
    closestGeofence.latitude,
    closestGeofence.longitude
  );

  for (let i = 1; i < orgGeofences.length; i++) {
    const geo = orgGeofences[i];
    const dist = calculateHaversineDistanceMeters(clientLat, clientLon, geo.latitude, geo.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closestGeofence = geo;
    }
  }

  const isWithinRadius = minDistance <= closestGeofence.radiusMeters;
  const isSpoofSuspected = clientAccuracy === 0 || clientAccuracy > 500;

  let policyVerdict: 'Allowed' | 'Allowed with Warning' | 'Approval Required' | 'Blocked' = 'Allowed';

  if (!isWithinRadius) {
    if (closestGeofence.policy === 'Strict Block' || closestGeofence.policy === 'Block') {
      policyVerdict = 'Blocked';
    } else if (closestGeofence.policy === 'Allow with Approval Required' || closestGeofence.policy === 'Manager Approval Required') {
      policyVerdict = 'Approval Required';
    } else {
      policyVerdict = 'Allowed with Warning';
    }
  }

  return {
    withinGeofence: isWithinRadius,
    distanceMeters: minDistance,
    matchedGeofence: closestGeofence,
    verifiedAt: new Date().toISOString(),
    statusText: isWithinRadius ? 'Inside Allowed Location' : 'Outside Authorized Location',
    policyVerdict,
    isSpoofSuspected,
  };
}
