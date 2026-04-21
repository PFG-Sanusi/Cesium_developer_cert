import { useState, useCallback } from 'react'
import { fetchElevations } from '@/lib/cesium/elevationService'
import { AppError } from '@/lib/errors/AppError'

/**
 * Hook to manage elevation fetching state and logic.
 */
export function useElevation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  /**
   * Fetches elevations for the given positions.
   * 
   * @param positions - List of lat/lon positions
   * @returns List of elevation values
   */
  const getElevations = useCallback(async (
    positions: Array<{ latitude: number; longitude: number }>
  ): Promise<number[]> => {
    if (positions.length === 0) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      const elevations = await fetchElevations(positions)
      return elevations
    } catch (err) {
      const appError = err instanceof AppError 
        ? err 
        : new AppError('ELEVATION_FETCH_FAILED', 'An unexpected error occurred while fetching elevation', err)
      setError(appError)
      throw appError
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    getElevations,
    clearError: () => setError(null)
  }
}
