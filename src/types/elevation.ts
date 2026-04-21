/**
 * Represents a single result from the Open-Elevation API.
 */
export interface ElevationLocation {
  /** Latitude of the point */
  latitude: number
  /** Longitude of the point */
  longitude: number
  /** Terrain elevation in meters */
  elevation: number
}

/**
 * Expected response structure from the Open-Elevation API.
 */
export interface OpenElevationResponse {
  /** List of elevation results */
  results: ElevationLocation[]
}
