import { useState, useCallback, useMemo } from 'react'
import { Cartesian3, Cartographic } from 'cesium'
import { v4 as uuidv4 } from 'uuid'
import type { Waypoint } from '@/types/waypoint'
import { MAX_WAYPOINTS, DRONE_ALTITUDE_CLEARANCE_M, FALLBACK_ELEVATION_M } from '@/constants/cesium'
import { AppError } from '@/lib/errors/AppError'
import { cartesian3ToCartographic, cartographicToLatLon } from '@/lib/cesium/terrainUtils'
import { useElevation } from './useElevation'

/**
 * Manages the ordered list of flight waypoints.
 * Enforces MAX_WAYPOINTS limit and handles terrain elevation resolution.
 */
export function useWaypoints() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const { isLoading: isLoadingElevation, error: elevationError, getElevations } = useElevation()

  /**
   * Adds a new waypoint at the given Cartesian position.
   * Resolves the terrain elevation + clearance before adding.
   * 
   * @param cartesian - Selected position on the globe
   */
  const addWaypoint = useCallback(async (cartesian: Cartesian3) => {
    if (waypoints.length >= MAX_WAYPOINTS) {
      throw new AppError('MAX_WAYPOINTS_REACHED', `Cannot add more than ${MAX_WAYPOINTS} waypoints`)
    }

    const carto = cartesian3ToCartographic(cartesian)
    const { lat, lon } = cartographicToLatLon(carto)

    let elevationM = DRONE_ALTITUDE_CLEARANCE_M
    
    try {
      const [terrainHeight] = await getElevations([{ latitude: lat, longitude: lon }])
      elevationM = terrainHeight + DRONE_ALTITUDE_CLEARANCE_M
    } catch (e) {
      console.warn('Failed to fetch elevation, using fallback clearance altitude', e)
      elevationM = FALLBACK_ELEVATION_M + DRONE_ALTITUDE_CLEARANCE_M
    }

    // Create final cartographic with adjusted height
    const finalCarto = Cartographic.fromRadians(carto.longitude, carto.latitude, elevationM)
    const finalCartesian = Cartographic.toCartesian(finalCarto)

    const newWaypoint: Waypoint = {
      id: uuidv4(),
      cartesian: finalCartesian,
      cartographic: finalCarto,
      elevationM,
      index: waypoints.length + 1
    }

    setWaypoints(prev => [...prev, newWaypoint])
  }, [waypoints, getElevations])

  /**
   * Removes a waypoint by ID and re-indexes the remaining list.
   */
  const removeWaypoint = useCallback((id: string) => {
    setWaypoints(prev => {
      const filtered = prev.filter(wp => wp.id !== id)
      return filtered.map((wp, i) => ({ ...wp, index: i + 1 }))
    })
  }, [])

  /**
   * Clears all waypoints.
   */
  const clearWaypoints = useCallback(() => {
    setWaypoints([])
  }, [])

  return useMemo(() => ({
    waypoints,
    isLoadingElevation,
    elevationError,
    addWaypoint,
    removeWaypoint,
    clearWaypoints
  }), [waypoints, isLoadingElevation, elevationError, addWaypoint, removeWaypoint, clearWaypoints])
}
