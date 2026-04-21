import { JulianDate, Cartesian3 } from 'cesium'
import type { Waypoint } from '@/types/waypoint'
import type { FlightConfig } from '@/types/flight'
import { DRONE_MODEL_PATH } from '@/constants/cesium'
import { computePathDistanceM, computeFlightDurationS } from './terrainUtils'

/**
 * Builds a valid CZML document from an ordered array of waypoints.
 * The drone travels at a constant speed between each segment.
 * 
 * @param waypoints - Ordered path waypoints
 * @param config - Flight configuration including speed
 * @returns CZML document as an array of packets
 */
export function buildCzml(
  waypoints: Waypoint[],
  config: Pick<FlightConfig, 'speedMs'>
): object[] {
  if (waypoints.length < 2) return []

  const totalDistance = computePathDistanceM(waypoints)
  const totalDurationS = computeFlightDurationS(totalDistance, config.speedMs)

  // JulianDate.now() returns the current system time as a JulianDate directly
  const startJulian = JulianDate.now()
  const stopJulian = JulianDate.addSeconds(startJulian, totalDurationS, new JulianDate())

  const startIso = JulianDate.toIso8601(startJulian)
  const stopIso = JulianDate.toIso8601(stopJulian)
  const availability = `${startIso}/${stopIso}`

  // Packet 1: Document metadata and clock setup
  const documentPacket = {
    id: 'document',
    name: 'Drone Flight Path',
    version: '1.0',
    clock: {
      interval: availability,
      currentTime: startIso,
      multiplier: 1,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK_MULTIPLIER'
    }
  }

  // Calculate arrival times for each waypoint based on distance from start
  const sampledPositions: (string | number)[] = []
  let cumulativeDistance = 0

  waypoints.forEach((wp, i) => {
    if (i > 0) {
      cumulativeDistance += Cartesian3.distance(waypoints[i - 1].cartesian, wp.cartesian)
    }

    const arrivalSeconds = computeFlightDurationS(cumulativeDistance, config.speedMs)
    const arrivalJulian = JulianDate.addSeconds(startJulian, arrivalSeconds, new JulianDate())
    const arrivalIso = JulianDate.toIso8601(arrivalJulian)

    // CZML SampledPosition expects [time, x, y, z, time, x, y, z, ...]
    sampledPositions.push(arrivalIso)
    sampledPositions.push(wp.cartesian.x)
    sampledPositions.push(wp.cartesian.y)
    sampledPositions.push(wp.cartesian.z)
  })

  // Packet 2: The Drone Entity
  const dronePacket = {
    id: 'drone',
    name: 'Flight Drone',
    availability,
    model: {
      gltf: DRONE_MODEL_PATH,
      minimumPixelSize: 64,
      maximumScale: 20000,
      runAnimations: true
    },
    position: {
      interpolationAlgorithm: 'LAGRANGE',
      interpolationDegree: 1,
      referenceFrame: 'FIXED',
      cartesian: sampledPositions
    },
    orientation: {
      velocityReference: '#position'
    },
    path: {
      show: true,
      width: 2,
      material: {
        solidColor: {
          color: {
            rgba: [255, 255, 0, 255]
          }
        }
      },
      resolution: 1
    }
  }

  return [documentPacket, dronePacket]
}

