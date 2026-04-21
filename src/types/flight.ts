/**
 * Configuration for the flight simulation.
 */
export interface FlightConfig {
  /** Speed of the drone in meters per second */
  speedMs: number
  /** Whether the camera should follow the drone */
  trackDrone: boolean
  /** Time multiplier for the Cesium clock */
  clockMultiplier: number
}

/**
 * Current status of the flight animation.
 */
export type AnimationStatus = 'idle' | 'loading' | 'playing' | 'stopped'

/**
 * Real-time telemetry data for the flight animation.
 */
export interface AnimationState {
  /** Current status of the animation */
  status: AnimationStatus
  /** Current latitude in degrees */
  currentLat: number | null
  /** Current longitude in degrees */
  currentLon: number | null
  /** Current altitude in meters */
  currentAltM: number | null
  /** Current speed in meters per second */
  currentSpeedMs: number | null
}
