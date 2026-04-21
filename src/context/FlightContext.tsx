import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { FlightConfig } from '@/types/flight'
import { DEFAULT_FLIGHT_SPEED_MS, CLOCK_MULTIPLIER_MIN } from '@/constants/cesium'
import { useWaypoints } from '@/hooks/useWaypoints'
import { useFlightPath } from '@/hooks/useFlightPath'
import { AppError } from '@/lib/errors/AppError'
import type { FlightContextValue } from './FlightContext.types'

const FlightContext = createContext<FlightContextValue | null>(null)

/**
 * Provider component for flight-related state.
 * Centralizes waypoint management, animation control, and configuration.
 */
export function FlightProvider({ children }: { children: ReactNode }) {
  // Config State
  const [config, setFullConfig] = useState<FlightConfig>({
    speedMs: DEFAULT_FLIGHT_SPEED_MS,
    trackDrone: false,
    clockMultiplier: CLOCK_MULTIPLIER_MIN
  })

  const setConfig = useCallback((updates: Partial<FlightConfig>) => {
    setFullConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Hook Integrations
  const waypointProps = useWaypoints()
  const flightProps = useFlightPath(waypointProps.waypoints, config)

  const value: FlightContextValue = useMemo(() => ({
    ...waypointProps,
    ...flightProps,
    config,
    setConfig
  }), [waypointProps, flightProps, config, setConfig])

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  )
}

/**
 * Hook to consume the flight context.
 * 
 * @throws Error if used outside of a FlightProvider
 */
export function useFlightContext(): FlightContextValue {
  const context = useContext(FlightContext)
  if (!context) {
    throw new AppError('PROVIDER_NOT_FOUND', 'useFlightContext must be used within a FlightProvider')
  }
  return context
}
