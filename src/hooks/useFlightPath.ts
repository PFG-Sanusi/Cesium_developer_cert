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
  const [telemState, setTelemState] = useState<Partial<AnimationState>>({
    currentLat: null,
    currentLon: null,
    currentAltM: null,
    currentSpeedMs: null
  })

  // CZML is rebuilt only when waypoints or speed changes
  const czmlData = useMemo(() => {
    if (waypoints.length < 2) return null
    try {
      return buildCzml(waypoints, { speedMs: config.speedMs })
    } catch (e) {
      console.error('CZML Build Failed', e)
      return null
    }
  }, [waypoints, config.speedMs])

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
    if (!czmlData) return
    setStatus('playing')
  }, [czmlData])

  /**
   * Stops the flight and resets all state to idle.
   */
  const stopFlight = useCallback(() => {
    setStatus('idle')
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
