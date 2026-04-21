# Drone Flight Path Visualizer

<p align="center">
  <img src="docs/screenshots/globe-overview.png" alt="Drone Flight Path Visualizer — Globe Overview" width="100%" />
</p>

<p align="center">
  <a href="https://cesium.com/cesiumjs/">
    <img src="https://img.shields.io/badge/CesiumJS-1.x-00B2EE?style=flat-square&logo=cesium&logoColor=white" alt="CesiumJS" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Strict" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </a>
  <a href="https://ui.shadcn.com/">
    <img src="https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=flat-square" alt="shadcn/ui" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Cesium_Certified_Developer-Submission-FF6B00?style=flat-square" alt="Cesium Certified Developer Submission" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Why CesiumJS](#why-cesiumjs)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Known Limitations](#known-limitations)
- [Future Work](#future-work)
- [References](#references)

---

## Overview

The **Drone Flight Path Visualizer** is a browser-based geospatial application that enables operators to plan and animate drone missions on a photorealistic 3D globe. Users place waypoints interactively on the globe surface, the system resolves terrain elevation for each waypoint via the Open-Elevation API, and the drone animates along the computed path using CesiumJS's native CZML animation engine.

The application was built as a project submission for the [Cesium Certified Developer](https://cesium.com/learn/certifications/) program. It demonstrates expert-level usage of CesiumJS including terrain-aware positioning, CZML time-dynamic scene construction, Resium-based React integration, and real-time telemetry readout using Cesium's internal clock system.

### Project Goals

- Demonstrate deep integration of CesiumJS within a production-grade React application
- Implement terrain-aware flight path planning without a backend or GIS server
- Provide a clear, extensible codebase that separates geospatial logic from UI concerns
- Serve as a reference architecture for CesiumJS + React + TypeScript projects

### What the Application Does

1. Renders a photorealistic 3D globe using CesiumJS with Cesium World Terrain
2. Accepts up to ten user-placed waypoints via globe click interactions
3. Fetches real terrain elevation for each waypoint from the Open-Elevation API
4. Adds a configurable clearance altitude above terrain to simulate safe drone flight
5. Constructs a CZML animation document from the resolved waypoints
6. Animates a 3D drone model along the path using CesiumJS's clock and timeline
7. Streams real-time telemetry (latitude, longitude, altitude, speed) to a HUD

---

## Why CesiumJS

This section addresses the certification requirement to articulate how and why CesiumJS was chosen as the core platform.

### Problems That CesiumJS Solves in This Project

**1. Accurate 3D Terrain**

Standard mapping libraries such as Leaflet and Mapbox GL render the world in 2.5D. A drone flight path that ignores terrain is operationally meaningless — a path computed at sea level will intersect mountains. CesiumJS provides `CesiumWorldTerrain`, a globally-accurate quantized-mesh terrain model that allows the application to query ground elevation at any coordinate and render the path correctly against real topography.

**2. Time-Dynamic Scene Rendering via CZML**

Animating a moving entity along a geospatial path requires more than moving a marker in a `requestAnimationFrame` loop. CesiumJS's CZML (Cesium Language) format is a JSON schema purpose-built for time-dynamic geospatial scenes. It allows the application to define an entity's position as a `SampledPositionProperty` — a sampled time series that CesiumJS interpolates between — and to attach a `VelocityOrientationProperty` so the drone's heading and pitch are automatically computed from its direction of travel. No equivalent exists in general-purpose mapping libraries.

**3. True 3D Entity Rendering**

CesiumJS renders the globe and all entities in a true 3D WebGL scene. A 3D drone model (`.glb`) loaded via `ModelGraphics` is placed at a real geodetic position with correct altitude, heading, pitch, and roll. The model scales correctly as the camera zooms and is occluded by terrain when flying behind a ridge. This is not possible in 2D or 2.5D mapping environments.

**4. Coordinated Clock and Timeline**

CesiumJS has a built-in `Clock` object that drives the entire scene. The Cesium timeline widget allows users to scrub through a flight, pause, rewind, and change playback speed — functionality that would require significant custom engineering in any other mapping environment. This application sets the clock's `startTime` and `stopTime` from the computed flight duration and exposes the multiplier to the user through a UI slider.

**5. Cesium Ion Asset Streaming**

Cesium Ion provides authenticated, on-demand streaming of global terrain and imagery assets. Rather than bundling or self-hosting terrain tiles, the application streams only the tiles needed for the current camera view. This keeps the application lightweight while providing access to globally-accurate terrain at every zoom level.

### What CesiumJS Cannot Be Replaced With Here

The combination of terrain-aware 3D entity placement, CZML time-dynamic animation, and a coordinated clock with scrubbing is unique to CesiumJS in the browser. Google Maps, Mapbox GL, OpenLayers, and Leaflet do not provide a unified, clock-driven, time-dynamic 3D entity system with terrain intersection support. For drone mission planning in the browser, CesiumJS is the only production-ready option.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      React Application                   │   │
│  │                                                          │   │
│  │  ┌─────────────┐   ┌──────────────────────────────────┐  │   │
│  │  │FlightContext│   │           UI Layer                │  │   │
│  │  │             │   │  ControlPanel  WaypointList       │  │   │
│  │  │ useWaypoints│   │  FlightControls  StatusBar        │  │   │
│  │  │ useFlightPath│  └──────────────────────────────────┘  │   │
│  │  │ useCesiumClock   ┌──────────────────────────────────┐  │   │
│  │  └──────┬──────┘   │         CesiumViewer.tsx          │  │   │
│  │         │           │  Resium <Viewer>                  │  │   │
│  │         │           │  Entity rendering                 │  │   │
│  │         │           │  CzmlDataSource                   │  │   │
│  │         └──────────►│  ScreenSpaceEventHandler          │  │   │
│  │                     └──────────────┬─────────────────┘  │   │
│  └──────────────────────────────────-─┼──────────────────┘   │   │
│                                       │                       │
│  ┌────────────────────────────────────▼──────────────────┐   │
│  │                    CesiumJS Engine                     │   │
│  │                                                        │   │
│  │   Clock / Timeline     CZML DataSource                 │   │
│  │   TerrainProvider      Entity Collection               │   │
│  │   Scene / Camera       SampledPositionProperty         │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  Cesium Ion API                Open-Elevation API
  (Terrain + Imagery)           (Ground elevation lookup)
```

### Data Flow

```
User clicks globe
       │
       ▼
CesiumViewer picks Cartesian3 position
       │
       ▼
useWaypoints.addWaypoint()
       │
       ▼
useElevation fetches terrain height from Open-Elevation API
       │
       ▼
Waypoint stored with resolved elevation + 50m clearance
       │
       ▼
czmlBuilder.buildCzml() constructs CZML document
       │
       ▼
CzmlDataSource loaded into Cesium scene
       │
       ▼
Cesium Clock drives drone animation along SampledPositionProperty
       │
       ▼
useCesiumClock tick → StatusBar updates telemetry in real time
```

---

## Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| 3D Globe & Animation | CesiumJS | Only browser-native platform with terrain-aware 3D entity animation and CZML |
| React Integration | Resium | Declarative JSX wrapper around CesiumJS — avoids imperative viewer management in components |
| Build Tool | Vite + vite-plugin-cesium | Fast HMR; `vite-plugin-cesium` handles Cesium's static asset pipeline automatically |
| Language | TypeScript (strict) | Enforces correctness across geospatial data structures and Cesium API calls |
| Styling | Tailwind CSS | Utility-first CSS keeps UI styles co-located with components without a CSS build step |
| UI Components | shadcn/ui | Unstyled, accessible components that compose well with Tailwind |
| Elevation API | Open-Elevation | Free, open-source REST API for terrain elevation lookup by lat/lon |
| Asset Streaming | Cesium Ion | Authenticated, globally-accurate terrain and imagery tile streaming |

---

## Project Structure

```
drone-flight-visualizer/
├── public/
│   └── models/
│       └── drone.glb                   # 3D drone model (user-supplied)
├── src/
│   ├── components/
│   │   ├── viewer/
│   │   │   ├── CesiumViewer.tsx        # Full-screen globe, click handler, entity rendering
│   │   │   └── CesiumViewer.types.ts   # Component prop interfaces
│   │   ├── panels/
│   │   │   ├── ControlPanel.tsx        # Fixed left sidebar shell
│   │   │   ├── WaypointList.tsx        # Ordered, deletable waypoint list
│   │   │   └── FlightControls.tsx      # Speed slider, start/stop/clear buttons
│   │   ├── hud/
│   │   │   ├── StatusBar.tsx           # Bottom telemetry bar
│   │   │   └── StatusBar.types.ts      # Props interface
│   │   └── ui/                         # shadcn/ui generated components
│   ├── hooks/
│   │   ├── useWaypoints.ts             # Waypoint CRUD + elevation resolution
│   │   ├── useFlightPath.ts            # CZML generation + animation state machine
│   │   └── useCesiumClock.ts           # Cesium clock tick subscription
│   ├── context/
│   │   ├── FlightContext.tsx           # Shared state provider
│   │   └── FlightContext.types.ts      # Context value interface
│   ├── lib/
│   │   ├── cesium/
│   │   │   ├── czmlBuilder.ts          # Pure function: Waypoint[] → CZML document
│   │   │   ├── elevationService.ts     # Open-Elevation API client
│   │   │   └── terrainUtils.ts         # Coordinate conversion + distance math
│   │   └── errors/
│   │       └── AppError.ts             # Typed application error class
│   ├── constants/
│   │   ├── cesium.ts                   # Ion token key, altitude, speed, limits
│   │   └── ui.ts                       # Z-indices, panel dimensions, durations
│   ├── types/
│   │   ├── waypoint.ts                 # Waypoint interface
│   │   ├── flight.ts                   # FlightConfig, AnimationState, AnimationStatus
│   │   └── elevation.ts                # OpenElevationResponse interface
│   ├── App.tsx                         # Root layout — composes viewer and overlays
│   └── main.tsx                        # Entry — sets Ion token, mounts FlightProvider
├── .env                                # VITE_CESIUM_ION_TOKEN (not committed)
├── .env.example                        # Token placeholder for collaborators
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Core Modules

### `czmlBuilder.ts`

The most technically significant module in the project. Takes a resolved array of `Waypoint` objects and a `FlightConfig` and produces a valid CZML document ready for loading into a `CzmlDataSource`.

Key decisions:
- **Linear interpolation (LAGRANGE degree 1):** Drones do not follow smooth curves between waypoints — they fly straight segments. Lagrange degree 1 produces linear interpolation between samples, matching real drone behaviour.
- **VelocityOrientationProperty:** Rather than computing heading manually, the drone's orientation is derived automatically from its velocity vector. This means the model always faces its direction of travel at no extra compute cost.
- **Clock computation:** The document's `clock` interval is computed from total path distance divided by configured speed, expressed as ISO 8601 interval strings. This ties Cesium's timeline directly to the physics of the flight.

### `elevationService.ts`

Sends a single batched POST request to the Open-Elevation API for all waypoints simultaneously. Sequential per-waypoint requests would introduce unacceptable latency and hit rate limits. The service maps the response back to the original waypoint order and adds `DRONE_ALTITUDE_CLEARANCE_M` (50 metres) on top of each ground elevation. Falls back to a flat 100m altitude if the API is unreachable, throwing a typed `AppError` with code `ELEVATION_FETCH_FAILED` so the UI can surface the failure correctly.

### `FlightContext.tsx`

The single source of truth for all flight state. `useWaypoints` and `useFlightPath` are instantiated here and their return values are distributed to the component tree via context. This prevents prop drilling and ensures that the Cesium viewer, the control panel, and the status bar all react to the same state without duplicating it.

### `useCesiumClock.ts`

Subscribes to `viewer.clock.onTick` using Cesium's `Event` API and calls the provided callback on every animation frame. Cleans up the event listener via the returned `removeEventListener` handle in the hook's cleanup function. This drives the StatusBar telemetry readout without coupling the clock to any component lifecycle.

---

## How It Works

### Step 1 — Waypoint Placement

The user clicks on the globe surface. `CesiumViewer` uses `viewer.scene.pickPosition(windowPosition)` to convert the screen-space click into a `Cartesian3` world coordinate. The result is validated (clicks on the sky return `undefined`) and passed to `useWaypoints.addWaypoint()`.

### Step 2 — Elevation Resolution

`useWaypoints` converts the `Cartesian3` to `Cartographic` using `Cartographic.fromCartesian()`, extracts the latitude and longitude in degrees, and calls `elevationService.fetchElevations()`. The API returns ground elevation in metres. The hook stores the waypoint with `elevation = groundElevation + DRONE_ALTITUDE_CLEARANCE_M`.

### Step 3 — CZML Construction

When the user clicks **Start Flight**, `useFlightPath` calls `czmlBuilder.buildCzml()`. This function:
1. Computes total path distance using `Cartesian3.distance()` between consecutive waypoints
2. Derives flight duration from distance and configured speed
3. Constructs ISO 8601 timestamps for each waypoint relative to a synthetic start time
4. Builds the CZML `document` packet with `clock` interval and multiplier
5. Builds the drone entity packet with `position` (sampled), `orientation` (velocity-derived), and `model` (GLB path)

### Step 4 — Animation

The CZML document is loaded into the Cesium scene via Resium's `<CzmlDataSource>`. Cesium's clock begins playing. The drone entity moves along its interpolated path. If `trackDrone` is enabled, `viewer.trackedEntity` is set to the drone entity and the camera follows it automatically.

### Step 5 — Telemetry

On every clock tick, `useCesiumClock` fires the registered callback. The callback retrieves the drone entity's current position via `entity.position.getValue(clock.currentTime)`, converts it to `Cartographic`, and updates the `AnimationState` in `FlightContext`. The `StatusBar` reads from context and displays the values.

---

## Screenshots

> Add screenshots to `docs/screenshots/` and update the paths below.

| Globe with waypoints | Flight in progress |
|---|---|
| ![Waypoints](docs/screenshots/waypoints.png) | ![Flight](docs/screenshots/flight.png) |

| Control panel | Status bar telemetry |
|---|---|
| ![Panel](docs/screenshots/panel.png) | ![HUD](docs/screenshots/hud.png) |

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 18.0.0 | LTS recommended |
| npm | >= 9.0.0 | Comes with Node 18 |
| Cesium Ion account | — | Free tier at [ion.cesium.com](https://ion.cesium.com) |
| Drone GLB model | — | Any `.glb` file; free models at [Sketchfab](https://sketchfab.com) |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/drone-flight-visualizer.git
cd drone-flight-visualizer

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

---

## Configuration

### Environment Variables

Edit `.env` and provide your Cesium Ion access token:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here
```

Obtain a free token at [ion.cesium.com](https://ion.cesium.com/tokens).

### Drone Model

Place a `.glb` file at the following path:

```
public/models/drone.glb
```

The application renders a fallback box entity if the model file is not found, so the app remains functional during development without a model.

### Flight Constants

Core flight parameters are defined in `src/constants/cesium.ts` and can be adjusted without touching component code:

```ts
DRONE_ALTITUDE_CLEARANCE_M = 50    // metres above terrain
MAX_WAYPOINTS              = 10    // maximum clickable waypoints
DEFAULT_FLIGHT_SPEED_MS    = 50    // metres per second
CLOCK_MULTIPLIER_MIN       = 1
CLOCK_MULTIPLIER_MAX       = 10
```

---

## Usage

```bash
# Start the development server
npm run dev

# Type-check without emitting files
npx tsc --noEmit

# Build for production
npm run build

# Preview the production build
npm run preview
```

### Placing Waypoints

1. Open the application in a browser at `http://localhost:5173`
2. Navigate the globe by clicking and dragging, scrolling to zoom
3. Click any point on the globe surface to place a waypoint
4. Up to ten waypoints can be placed; the list appears in the left panel
5. Individual waypoints can be removed using the delete button in the list

### Running a Flight

1. Place at least two waypoints
2. Adjust the playback multiplier using the speed slider (1x–10x)
3. Click **Start Flight** — the drone will animate along the path
4. Toggle **Track Drone** to have the camera follow the drone
5. Click **Stop** to reset the animation to idle
6. Click **Clear** to remove all waypoints and reset the scene

---

## Known Limitations

| Limitation | Detail |
|---|---|
| Open-Elevation API availability | The public Open-Elevation API has no SLA and can experience downtime. The application falls back to 100m flat altitude when the API is unreachable. |
| No path editing | Waypoints cannot be dragged after placement. They must be deleted and re-placed. |
| Linear interpolation only | The drone flies straight segments between waypoints. Curved path interpolation (Hermite, Catmull-Rom) is not implemented. |
| No collision detection | The clearance altitude is a flat offset above terrain elevation at each waypoint. The path between waypoints is not checked for terrain intersection. |
| Single flight path | The application supports one active flight path at a time. Multiple concurrent paths are not supported. |
| No authentication | Cesium Ion token is stored in a client-side environment variable. This is acceptable for local development but not for production deployment. |

---

## Future Work

| Feature | Description |
|---|---|
| Terrain intersection check | Sample elevation along each path segment and raise the path above any intermediate terrain peaks |
| Draggable waypoints | Allow waypoints to be repositioned by dragging on the globe surface |
| Path export | Export the flight path as GeoJSON or KML for use in real drone mission planning software |
| Multiple drone support | Load multiple CZML datasources and animate several drones simultaneously |
| Offline terrain | Bundle terrain tiles for a target region to remove the Cesium Ion dependency |
| Real ADS-B integration | Replace synthetic waypoints with live ADS-B position feeds to track real aircraft |
| Cesium 3D Tiles | Load photogrammetry or LiDAR datasets via 3D Tiles to visualise flights over detailed urban environments |
| Replay and recording | Record a flight session as CZML and replay it at a later time |

---

## References

- [CesiumJS Documentation](https://cesium.com/learn/cesiumjs/ref-doc/)
- [CZML Guide](https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/CZML-Guide)
- [Resium Documentation](https://resium.reearth.io/)
- [Cesium Ion](https://ion.cesium.com/)
- [Open-Elevation API](https://open-elevation.com/)
- [SampledPositionProperty](https://cesium.com/learn/cesiumjs/ref-doc/SampledPositionProperty.html)
- [VelocityOrientationProperty](https://cesium.com/learn/cesiumjs/ref-doc/VelocityOrientationProperty.html)
- [CzmlDataSource](https://cesium.com/learn/cesiumjs/ref-doc/CzmlDataSource.html)
- [Cesium Certified Developer Program](https://cesium.com/learn/certifications/)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built as a submission for the <a href="https://cesium.com/learn/certifications/">Cesium Certified Developer</a> program.
</p>