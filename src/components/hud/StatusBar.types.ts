import type { AnimationState } from '@/types/flight'

/**
 * Props for the StatusBar HUD component.
 */
export interface StatusBarProps {
  /** Current telemetry state from the flight animation */
  animationState: AnimationState
}
