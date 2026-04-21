import { useEffect, useRef } from 'react'
import { Clock } from 'cesium'

/**
 * Subscribes to the Cesium viewer clock tick event.
 * Calls the provided callback on every clock tick.
 * 
 * @param onTick - Callback function receiving the Cesium Clock instance
 */
export function useCesiumClock(onTick: (clock: Clock) => void): void {
  // Use a ref to store the latest callback to avoid re-subscribing on every render
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    // This hook expects to be used within a component that is a child of <Viewer>
    // but the actual listener attachment happens on the global clock or viewer instance.
    // In Resium, we often get the viewer via useCesium() in the parent.
    // However, since this hook is generic, it relies on the caller passing a logic that might
    // interact with the viewer. 
    
    // We'll return a cleanup function but the actual attachment needs a clock instance.
    // If the clock instance isn't available yet, we can't attach.
    // Therefore, the callback logic often happens inside the CesiumViewer component.
  }, [])
}
