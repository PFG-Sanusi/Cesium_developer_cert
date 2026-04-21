import { Cartesian3 } from 'cesium'

/**
 * Props for the CesiumViewer component.
 */
export interface CesiumViewerProps {
  /** Callback triggered when a valid position on the globe is clicked */
  onPointClick: (cartesian: Cartesian3) => void
}
