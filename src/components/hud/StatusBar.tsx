import { memo } from 'react'
import type { AnimationState } from '@/types/flight'
import { cn } from '@/lib/utils'
import { HUD_HEIGHT_CLASS } from '@/constants/ui'

interface TelemetryItemProps {
  label: string
  value: string | number | null
  unit?: string
}

const TelemetryItem = ({ label, value, unit }: TelemetryItemProps) => {
  const displayValue = value === null ? '—' : (typeof value === 'number' ? value.toFixed(3) : value)
  return (
    <div className="flex items-center gap-2 px-4 border-r border-slate-200 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-mono text-slate-900 font-medium min-w-[60px]">
        {displayValue}
        {value !== null && unit && <span className="ml-0.5 text-[10px]">{unit}</span>}
      </span>
    </div>
  )
}

/**
 * Bottom HUD bar displaying real-time drone telemetry.
 * Updated via the flight animation clock.
 */
export const StatusBar = memo(({ animationState }: { animationState: AnimationState }) => {
  const { currentLat, currentLon, currentAltM, currentSpeedMs } = animationState

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-200 flex items-center px-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]",
      HUD_HEIGHT_CLASS
    )}>
      <TelemetryItem label="LAT" value={currentLat} unit="°" />
      <TelemetryItem label="LON" value={currentLon} unit="°" />
      <TelemetryItem label="ALT" value={currentAltM} unit="m" />
      <TelemetryItem label="SPD" value={currentSpeedMs} unit="m/s" />
      
      <div className="ml-auto flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          animationState.status === 'playing' ? "bg-green-600 animate-pulse" : "bg-slate-300"
        )} />
        <span className="text-[10px] font-bold text-slate-500 uppercase">{animationState.status}</span>
      </div>
    </div>
  )
})

StatusBar.displayName = 'StatusBar'
