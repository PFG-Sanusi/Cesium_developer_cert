import { Card } from '@/components/ui/card'
import { WaypointList } from './WaypointList'
import { FlightControls } from './FlightControls'
import { cn } from '@/lib/utils'
import { PANEL_WIDTH_CLASS } from '@/constants/ui'

/**
 * Sidebar shell for the visualizer controls.
 * Composes the waypoint list and flight operation controls.
 */
export function ControlPanel() {
  return (
    <div className={cn(
      "fixed top-4 left-4 z-[1000] flex flex-col gap-4",
      PANEL_WIDTH_CLASS
    )}>
      <Card className="bg-white border-slate-200 shadow-2xl shadow-black/20 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Drone Visualizer</h1>
          <p className="text-xs text-slate-500">Production-grade Flight Path Engine</p>
        </div>
        
        <FlightControls />
        
        <div className="h-[1px] bg-border/50 mx-4" />
        
        <WaypointList />
      </Card>
    </div>
  )
}
