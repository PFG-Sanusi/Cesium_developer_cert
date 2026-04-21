import type { Cartesian3, Cartographic } from 'cesium'

/**
 * Represents a single point in the drone's flight path.
 */
export interface Waypoint {
  /** Unique identifier for the waypoint */
  readonly id: string
  /** 3D Cartesian coordinates in Earth-Fixed-Earth-Centered frame */
  readonly cartesian: Cartesian3
  /** Geodetic coordinates (longitude, latitude, height) */
  readonly cartographic: Cartographic
  /** Calculated elevation in meters (terrain height + clearance) */
  readonly elevationM: number
  /** Order of the waypoint in the path (1-based) */
  readonly index: number
}
