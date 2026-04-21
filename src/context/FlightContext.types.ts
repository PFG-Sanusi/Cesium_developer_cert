import type { Waypoint } from '@/types/waypoint'
import type { FlightConfig, AnimationState } from '@/types/flight'
import type { AppError } from '@/lib/errors/AppError'
import type { Cartesian3 } from 'cesium'

export interface FlightContextValue {
  // Waypoint State
  waypoints: Waypoint[]
  isLoadingElevation: boolean
  elevationError: AppError | null
  addWaypoint: (cartesian: Cartesian3) => Promise<void>
  removeWaypoint: (id: string) => void
  clearWaypoints: () => void

  // Flight State
  animationState: AnimationState
  czmlData: object[] | null
  startFlight: () => void
  stopFlight: () => void
  updateTelemetry: (state: Partial<AnimationState>) => void

  // Config State
  config: FlightConfig
  setConfig: (config: Partial<FlightConfig>) => void
}
