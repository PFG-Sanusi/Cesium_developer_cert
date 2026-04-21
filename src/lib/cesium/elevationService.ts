import { ELEVATION_API_URL } from '@/constants/cesium'
import type { OpenElevationResponse } from '@/types/elevation'
import { AppError } from '@/lib/errors/AppError'

/**
 * Fetches terrain elevation for an array of lat/lon positions
 * from the Open-Elevation API.
 * 
 * @param positions - List of latitude and longitude objects
 * @returns Promise resolving to an array of elevation values in meters
 * @throws AppError if the network request fails or returns an error
 */
export async function fetchElevations(
  positions: Array<{ latitude: number; longitude: number }>
): Promise<number[]> {
  if (positions.length === 0) return []

  try {
    const response = await fetch(ELEVATION_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locations: positions })
    })

    if (!response.ok) {
      throw new AppError(
        'ELEVATION_FETCH_FAILED',
        `Elevation API returned status ${response.status}: ${response.statusText}`
      )
    }

    const data: OpenElevationResponse = await response.json()
    
    if (!data.results || data.results.length !== positions.length) {
      throw new AppError(
        'ELEVATION_FETCH_FAILED',
        'Elevation API returned unexpected result structure or count'
      )
    }

    return data.results.map((res) => res.elevation)
  } catch (error) {
    if (error instanceof AppError) throw error
    
    throw new AppError(
      'ELEVATION_FETCH_FAILED',
      'Failed to connect to elevation service',
      error
    )
  }
}
