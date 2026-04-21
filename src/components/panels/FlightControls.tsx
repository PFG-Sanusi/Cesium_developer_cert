import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Square, 
  Trash2, 
  Loader2, 
  Crosshair,
  FastForward
} from 'lucide-react'
import { useFlightContext } from '@/context/FlightContext'
import { CLOCK_MULTIPLIER_MIN, CLOCK_MULTIPLIER_MAX } from '@/constants/cesium'
import { cn } from '@/lib/utils'

/**
 * Control panel section for flight operations and settings.
 * Manages the transition between planning and flying states.
 */
export function FlightControls() {
  const { 
    waypoints, 
    clearWaypoints, 
    animationState, 
    startFlight, 
    stopFlight,
    config,
    setConfig,
    isLoadingElevation
  } = useFlightContext()

  const isPlaying = animationState.status === 'playing'
  const canStart = waypoints.length >= 2 && animationState.status !== 'loading'
  
  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Speed Multiplier Slider */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <FastForward className="w-3 h-3" />
            Playback Multiplier
          </span>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded">
            {config.clockMultiplier}x
          </span>
        </div>
        <Slider 
          value={[config.clockMultiplier]}
          min={CLOCK_MULTIPLIER_MIN}
          max={CLOCK_MULTIPLIER_MAX}
          step={1}
          onValueChange={([val]) => setConfig({ clockMultiplier: val })}
          disabled={isPlaying}
          className="py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Main Action Button (Start / Stop) */}
        {!isPlaying ? (
          <Button 
            onClick={startFlight} 
            disabled={!canStart}
            className="flex-1 gap-2 font-bold shadow-lg shadow-primary/20"
          >
            {animationState.status === 'loading' || isLoadingElevation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Start Flight
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            onClick={stopFlight}
            className="flex-1 gap-2 font-bold shadow-lg shadow-destructive/20"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Flight
          </Button>
        )}

        {/* Clear / Track Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setConfig({ trackDrone: !config.trackDrone })}
            className={cn(
              "flex-1 gap-2 transition-all",
              config.trackDrone && "bg-primary/10 border-primary text-primary"
            )}
            title="Track Drone Camera"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={clearWaypoints}
            disabled={isPlaying}
            className="flex-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Clear All Waypoints"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
