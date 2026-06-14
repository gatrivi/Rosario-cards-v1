# Architecture Overview

## Entry point / view routing
`src/App.js` owns top-level mode switches:
- `showStats` => `src/components/StatsView.jsx`
- `showRosedal` => `src/components/Rosedal/RosedalView`
- `showDailyTracker` => `src/components/Rosedal/DailyTracker`
- Default => `src/components/Views/RosarioVirtualView.jsx`

Default mode passes UI state into `RosarioVirtualView`, including:
- `currentPrayerIndex` (mapped from `activeIndex`)
- `misterioActual` (selected mystery)
- interaction flags: `soundEnabled`, `isLeftHanded`, `simpleMode`
- view callbacks: `onShowStats`, `onShowRosedal`, `onToggleSimpleMode`

## Core runtime model (main interactive mode)
`RosarioVirtualView` is the “moment-to-moment” orchestrator:
- Computes `secuencia` from `getSequenceData(misterioActual)`
- Tracks progression state locally:
  - `versoIndex` (current verse index within the current prayer unit)
  - `cargaOracion` (0..100 charge/progress accumulator)
  - `warmthTick` (used by visuals while charging)
  - `guided` (hold-to-charge hinting/behavior; can be toggled libre/guiado)

## Layering contract (main screen)
Main screen is layered as:
1. Ambient depth: `SacredDust`
2. Bloom effect overlay (non-interactive; pointerEvents none)
3. Moment layer (zIndex ~5): sacred icon/drawing + sacred text, or `RosaEnFocoView` for Ave María
4. Physics rosary layer (zIndex ~20): `VirtualRosaryPhysics` (fully interactive)
5. Floating UI chrome (zIndex ~25): mode toggle buttons + version label + verse counters

This keeps prayers visible “around/through” beads by design (moment layer never blocks pointer events to the rosary layer).

## Interaction mapping (what advances)
`RosarioVirtualView` defines:
- `handleAdvance`: advances verse within the active unit, otherwise advances `onUpdateProgreso(currentPrayerIndex + 1)`
- `handleRetreat`: retreats verse/unit similarly
- charging logic:
  - In guided interaction, `VirtualRosaryPhysics` can call empty-pointer handlers to start/stop charging (`setIsCargando`, resets `cargaOracion`/`warmthTick`)
  - completion triggers `handleAdvance()` (including vibrate if available)

## Libraries used (baseline)
- React 19 + Create React App
- Matter.js (in `VirtualRosaryPhysics`)
- Web Audio API (procedural audio in the rosary interaction layer)
- SVG/Canvas for procedural drawings/overlays

## Version baseline
UI version label shown in the main view is:
- `v0.3.35 — El Cosmos Resonante`

