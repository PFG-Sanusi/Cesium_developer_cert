import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, MousePointer2 } from 'lucide-react'
import { useFlightContext } from '@/context/FlightContext'
import { cartographicToLatLon } from '@/lib/cesium/terrainUtils'
import { cn } from '@/lib/utils'

/**
 * Interactive list of waypoints.
 * Allows deleting individual points and shows empty state.
 */
export function WaypointList() {
  const { waypoints, removeWaypoint, animationState } = useFlightContext()
  const isLocked = animationState.status === 'playing'

  if (waypoints.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <MousePointer2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Click the globe to add<br />flight waypoints
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waypoint Path</span>
        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600 font-mono">{waypoints.length} / 10</Badge>
      </div>
      
      {waypoints.map((wp) => {
        const { lat, lon } = cartographicToLatLon(wp.cartographic)
        return (
          <div 
            key={wp.id}
            className={cn(
              "group flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/50 transition-all",
              isLocked && "opacity-50 grayscale pointer-events-none"
            )}
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-mono text-[10px] bg-white border-slate-200 text-slate-900">
                {wp.index}
              </Badge>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-slate-900 whitespace-nowrap">
                  {lat.toFixed(3)}°, {lon.toFixed(3)}°
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">
                  Alt: {wp.elevationM.toFixed(0)}m
                </span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => removeWaypoint(wp.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
