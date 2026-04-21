import { useState, useCallback, useMemo } from 'react'
import type { Waypoint } from '@/types/waypoint'
import type { FlightConfig, AnimationState, AnimationStatus } from '@/types/flight'
import { buildCzml } from '@/lib/cesium/czmlBuilder'

/**
 * Builds and controls the CZML-based drone animation.
 * Logic handles building CZML from waypoints and controlling the state machine.
 */
export function useFlightPath(waypoints: Waypoint[], config: FlightConfig) {
  const [status, setStatus] = useState<AnimationStatus>('idle')
  const [czmlData, setCzmlData] = useState<object[] | null>(null)
  const [telemState, setTelemState] = useState<Partial<AnimationState>>({
    currentLat: null,
    currentLon: null,
    currentAltM: null,
    currentSpeedMs: null
  })

  /**
   * Updates the real-time telemetry state.
   */
  const updateTelemetry = useCallback((state: Partial<AnimationState>) => {
    setTelemState(prev => ({ ...prev, ...state }))
  }, [])

  /**
   * Starts the flight animation.
   */
  const startFlight = useCallback(() => {
    if (waypoints.length < 2) return

    try {
      // Build CZML at click-time so clock interval is always fresh.
      const nextCzml = buildCzml(waypoints, { speedMs: config.speedMs })
      setCzmlData(nextCzml)
    } catch (e) {
      console.error('CZML Build Failed', e)
      setCzmlData(null)
      return
    }

    setStatus('playing')
  }, [waypoints, config.speedMs])

  /**
   * Stops the flight and resets all state to idle.
   */
  const stopFlight = useCallback(() => {
    setStatus('idle')
    setCzmlData(null)
    setTelemState({
      currentLat: null,
      currentLon: null,
      currentAltM: null,
      currentSpeedMs: null
    })
  }, [])

  const animationState: AnimationState = useMemo(() => ({
    status,
    currentLat: telemState.currentLat ?? null,
    currentLon: telemState.currentLon ?? null,
    currentAltM: telemState.currentAltM ?? null,
    currentSpeedMs: telemState.currentSpeedMs ?? null,
  }), [status, telemState.currentLat, telemState.currentLon, telemState.currentAltM, telemState.currentSpeedMs])

  return useMemo(() => ({
    animationState,
    czmlData,
    startFlight,
    stopFlight,
    updateTelemetry
  }), [animationState, czmlData, startFlight, stopFlight, updateTelemetry])
}
