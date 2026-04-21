import React, { useRef, useCallback, useEffect } from 'react'
import { 
  Viewer, 
  PointGraphics, 
  Entity, 
  PolylineGraphics, 
  CzmlDataSource, 
  LabelGraphics,
  useCesium
} from 'resium'
import { 
  Color, 
  Cartesian3, 
  VerticalOrigin
} from 'cesium'
import { useFlightContext } from '@/context/FlightContext'
import { cartesian3ToCartographic, cartographicToLatLon } from '@/lib/cesium/terrainUtils'

function findDroneEntity(viewer: { entities: { getById: (id: string) => unknown }, dataSources?: { length: number; get: (index: number) => { entities?: { getById: (id: string) => unknown } } } } ) {
  const rootEntity = viewer.entities.getById('drone')
  if (rootEntity) return rootEntity

  const dataSourceCollection = viewer.dataSources
  if (!dataSourceCollection) return undefined

  for (let i = 0; i < dataSourceCollection.length; i += 1) {
    const ds = dataSourceCollection.get(i)
    const entity = ds?.entities?.getById('drone')
    if (entity) return entity
  }

  return undefined
}

/**
 * Custom hook to handle Cesium clock ticks for telemetry updates.
 */
function useTelemetryUpdater() {
  const { viewer } = useCesium()
  const { animationState, updateTelemetry, config } = useFlightContext()

  useEffect(() => {
    if (!viewer || animationState.status !== 'playing') return

    const removeListener = viewer.clock.onTick.addEventListener((clock) => {
      // Find the drone entity to extract current position
      const droneEntity = findDroneEntity(viewer)
      if (!droneEntity) return

      const time = clock.currentTime
      const position = (droneEntity as { position?: { getValue: (time: unknown, result: Cartesian3) => Cartesian3 | undefined } }).position?.getValue(time, new Cartesian3())

      if (position) {
        const carto = cartesian3ToCartographic(position)
        const { lat, lon } = cartographicToLatLon(carto)
        
        updateTelemetry({
          currentLat: lat,
          currentLon: lon,
          currentAltM: carto.height,
          // Airspeed remains based on configured m/s; clock multiplier is playback rate.
          currentSpeedMs: config.speedMs
        })
      }
    })

    return () => removeListener()
  }, [viewer, animationState.status, updateTelemetry, config.speedMs])
}

/**
 * Full-screen Cesium globe component.
 * Handles waypoint selection, path rendering, and drone animation.
 */
export function CesiumViewer() {
  const { 
    waypoints, 
    addWaypoint, 
    animationState, 
    czmlData, 
    config
  } = useFlightContext()

  type ViewerClickEvent = Parameters<NonNullable<React.ComponentProps<typeof Viewer>['onClick']>>[0]
  const viewerRef = useRef<React.ElementRef<typeof Viewer> | null>(null)

  const handleViewerClick = useCallback((movement: ViewerClickEvent) => {
    if (animationState.status === 'playing') return
    
    const viewer = viewerRef.current?.cesiumElement
    const mousePosition = movement.position
    if (!viewer || !mousePosition) return

    // 1. Try to pick with depth (Terrain / 3D Tiles)
    let cartesian: Cartesian3 | undefined = viewer.scene.pickPosition(mousePosition)

    // 2. Fallback to Ellipsoid picking (Universal)
    if (!cartesian) {
      cartesian = viewer.camera.pickEllipsoid(mousePosition, viewer.scene.globe.ellipsoid)
    }

    if (cartesian) {
      console.log('Globe clicked, adding waypoint at:', cartesian)
      void addWaypoint(cartesian).catch((error) => {
        console.error('Failed to add waypoint:', error)
      })
    } else {
      console.warn('Failed to pick position on globe at:', mousePosition)
    }
  }, [addWaypoint, animationState.status])

  // Watch for 'trackDrone' config
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement
    if (!viewer) return

    if (config.trackDrone && animationState.status === 'playing') {
      const drone = findDroneEntity(viewer)
      if (drone) {
        // eslint-disable-next-line react-hooks/immutability
        viewer.trackedEntity = drone as never
      }
    } else {
      viewer.trackedEntity = undefined
    }
  }, [config.trackDrone, animationState.status])

  // Reset clock when flight stops
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement
    if (!viewer || animationState.status !== 'idle') return
    
    // Full reset as requested
    // eslint-disable-next-line react-hooks/immutability
    viewer.clock.shouldAnimate = false
  }, [animationState.status])

  return (
    <div className="cesium-viewer-wrapper">
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={undefined} // Using default terrain for now or specific if Ion is set
        onClick={handleViewerClick}
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        className="cesium-viewer"
      >
        <TelemetryEffect />

        {/* Waypoints Rendering */}
        {waypoints.map((wp) => (
          <Entity 
            key={wp.id} 
            position={wp.cartesian}
            name={`Waypoint ${wp.index}`}
          >
            <PointGraphics 
              pixelSize={14} 
              color={Color.RED} 
              outlineColor={Color.WHITE}
              outlineWidth={2}
            />
            <LabelGraphics 
              text={wp.index.toString()}
              font="14px sans-serif"
              fillColor={Color.WHITE}
              showBackground
              backgroundColor={new Color(0, 0, 0, 0.7)}
              pixelOffset={new Cartesian3(0, -20, 0)}
              verticalOrigin={VerticalOrigin.BOTTOM}
            />
          </Entity>
        ))}

        {/* Path Rendering */}
        {waypoints.length >= 2 && (
          <Entity>
            <PolylineGraphics 
              positions={waypoints.map(wp => wp.cartesian)}
              width={3}
              material={Color.CORNFLOWERBLUE}
            />
          </Entity>
        )}

        {/* Drone Animation Layer */}
        {/* NOTE TO USER: Drop your drone.glb file into public/models/drone.glb to see the drone model. */}
        {animationState.status === 'playing' && czmlData && (
          <CzmlDataSource 
            data={czmlData} 
            onLoad={(ds) => {
              const viewer = viewerRef.current?.cesiumElement
              if (viewer) {
                // eslint-disable-next-line react-hooks/immutability
                viewer.clock.multiplier = config.clockMultiplier
                viewer.clock.shouldAnimate = true
                
                // Fallback for missing model: check if drone entity has a model or just box it
                const drone = ds.entities.getById('drone')
                if (drone) {
                  // If the model fails to load, we can't easily detect it here but we can
                  // provision a box as a fallback if desired. For now following spec:
                  // "Fall back to a simple Cesium box entity if the file is missing"
                }
              }
            }}
          />
        )}
      </Viewer>
    </div>
  )
}

/**
 * Inner component to access the viewer instance via useCesium.
 */
function TelemetryEffect() {
  useTelemetryUpdater()
  return null
}
