import { CesiumViewer } from '@/components/viewer/CesiumViewer'
import { ControlPanel } from '@/components/panels/ControlPanel'
import { StatusBar } from '@/components/hud/StatusBar'
import { useFlightContext } from '@/context/FlightContext'

/**
 * Main Application Component.
 * Orchestrates the full-screen globe viewer and UI overlays.
 */
function App() {
  const { animationState } = useFlightContext()

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-primary/30">
      {/* 1. The 3D Globe Layer (Bottom) */}
      <CesiumViewer />
      
      {/* 2. Control Layout Layer (Overlay) */}
      <ControlPanel />
      
      {/* 3. Telemetry HUD Layer (Overlay) */}
      <StatusBar animationState={animationState} />
    </div>
  )
}

export default App
