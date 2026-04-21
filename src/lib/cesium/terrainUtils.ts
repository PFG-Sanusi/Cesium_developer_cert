import { Cartesian3, Cartographic, Math as CesiumMath } from 'cesium'
import type { Waypoint } from '@/types/waypoint'

/**
 * Converts a Cartesian3 position to geodetic Cartographic coordinates.
 * 
 * @param cartesian - Position in ECEF coordinates
 * @returns Geodetic coordinates (lon/lat/height)
 */
export function cartesian3ToCartographic(cartesian: Cartesian3): Cartographic {
  return Cartographic.fromCartesian(cartesian)
}

/**
 * Converts Cartographic coordinates to simple latitude/longitude degrees.
 * 
 * @param carto - Cartographic position
 * @returns Latitude and longitude in degrees
 */
export function cartographicToLatLon(carto: Cartographic): { lat: number; lon: number } {
  return {
    lat: CesiumMath.toDegrees(carto.latitude),
    lon: CesiumMath.toDegrees(carto.longitude)
  }
}

/**
 * Computes the total distance of a flight path in meters.
 * Sums the Euclidean distance between consecutive waypoints.
 * 
 * @param waypoints - Ordered list of waypoints
 * @returns Total distance in meters
 */
export function computePathDistanceM(waypoints: Waypoint[]): number {
  let distance = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    distance += Cartesian3.distance(waypoints[i].cartesian, waypoints[i + 1].cartesian)
  }
  return distance
}

/**
 * Computes flight duration in seconds based on distance and constant speed.
 * 
 * @param distanceM - Distance in meters
 * @param speedMs - Speed in meters per second
 * @returns Duration in seconds
 */
export function computeFlightDurationS(distanceM: number, speedMs: number): number {
  if (speedMs <= 0) return 0
  return distanceM / speedMs
}
