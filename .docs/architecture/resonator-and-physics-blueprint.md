# Resonator + Physics Stabilization Blueprint

Deliverable of this blueprint: a dense technical specification plus a file-by-file task list for implementing a Working Prototype of two mythos-class features: Matter.js Rosary Stabilization and a deterministic, offline Web Audio Cosmic Resonator soundscape.

Current version (UI baseline): `v0.3.35 — El Cosmos Resonante`
Implementation target phase: `v0.3.35 — El Cosmos Resonante`

## Grounding references
- [VirtualRosaryPhysics.jsx](src/components/RosarioNube/VirtualRosaryPhysics.jsx)
- [physicsRosaryData.js](src/data/physicsRosaryData.js)
- [audioManager.js](src/utils/audioManager.js)
- [cosmicModulator.js](src/utils/cosmicModulator.js)
- [physics-blueprint-v4.md](.docs/virtual-rosary/physics-blueprint-v4.md)
- [cosmic-modulator.md](.docs/sacred-cosmic/cosmic-modulator.md)

---

## FEATURE 1 — Matter.js Rosary Stabilization

### 1.1 Engine + per-body parameters (velvet, tactile, dead chain)

Target engine config (deterministic + CPU-safe):
```js
Engine.create({
  gravity: { x: 0, y: 0 },
  positionIterations: 8,
  velocityIterations: 6,
  constraintIterations: 4,
})
```

Per-body physical feel:
- `restitution: 0.0` (dead impacts; prevents kinetic energy gain)
- `frictionAir: 0.06` (heavy velvet settling)
- `friction: 0.5`
- `slop: 0.05`
- Role-based density hierarchy (heft):
  - group bead: `0.010`
  - lone / Padre: `0.020`
  - medal: `0.040`
  - cross: `0.060`

Impact-sound enablement:
- Collision decision: change `Matter.Body.nextGroup(true)` to `Matter.Body.nextGroup(false)` so `collisionStart` can fire between rosary beads.

### 1.2 Deterministic constraint resolution (anti-knot, blueprint-exact)

Key structural knot fix:
- explicit medal left/right port offsets on loop closure:
  - `medal_port_left {x:-9,y:-5}`
  - `medal_port_right {x:+9,y:-5}`
- loop start attaches to right port; loop end attaches to left port.

Constraint classes + parameters (stable, not explosive):
```txt
tight_link  : length = 2*r + 1,  stiffness 0.85, damping 0.12
long_chain  : length = 2*r + 18, stiffness 0.65, damping 0.18
short_chain : length = 2*r + 8,  stiffness 0.80, damping 0.15
```

Deterministic build order (pseudocode):
```txt
buildRosary(topology, anchors):
  create bodies in deterministic order
  iterate topology.edges in declared order:
    create Constraint(bodyA, bodyB, classParams[edge.link])
    apply medal port offsets when edge uses medal ports
  world.add(bodies + constraints) preserving constraint edge order
```

### 1.3 Always-on critically-damped home tether (anti-knot + velvet reform)

Home forces must exist continuously (not only during cross-gesture magnetism) to avoid long-session tangles:
- weak always-on tether
- stronger temporary boost only during magnetism gesture

### 1.4 Performance-safe containment (no offscreen drift, O(n))

Containment clamp added to `onBeforeUpdate`:
- margin ~20px
- zero only the outward component of velocity on each axis
- cap velocity magnitude (e.g. 25 px/frame equivalent)

### 1.5 Fixed-timestep guard

Keep `Engine.update(engine, 1000/60)` but skip updates during hidden tabs (`document.hidden`) to avoid dt spirals.

---

## FEATURE 2 — Cosmic Resonator Soundscape

(See phase execution for finalized integration details.)

---

## Implementation phase: ultra-discrete tasks

File-by-file execution order for a Nano-class executor:
1) audio constants
2) cosmic mapper
3) resonator class
4) audio wiring
5) rosary topology data
6) engine/body params
7) constraint builder + medal ports
8) tether + containment + distance correction
9) version bump + doc updates

---

## Ecclesiastical Latin Naming Migration Note

This version may introduce forward-looking Ecclesiastical Latin naming for newly-added internal audio/feature variables.
A global project-wide migration to Ecclesiastical Latin naming conventions is planned for a later phase.

---

## Phase 1 — Technical Implementation Notes (Completed in `v0.3.35`)

### A) Deterministic topology data
- Added `src/data/rosaryTopology.js`.
- Implements deterministic edge ordering:
  - Loop sequential edges classified by fixed ring indices (decade clusters of 10 group-beads + lone beads at indices `10, 21, 32, 43` when `loopBodies.length === 54`).
  - Explicit anti-knot loop closures:
    - `loopBodies[0] -> centerBody` using `medal_port_right {x:+9,y:-5}`
    - `loopBodies[last] -> centerBody` using `medal_port_left {x:-9,y:-5}`
  - Tail edges remain a deterministic down-chain from `centerBody` through `pendantBodies[]`, preserving cross offset behavior in constraint attachment points.

### B) Matter.js stability tuning
- `Engine.create` updated to:
  - `positionIterations: 8`
  - `velocityIterations: 6`
  - `constraintIterations: 4`
- Impact/collision correctness:
  - changed `Matter.Body.nextGroup(true)` -> `Matter.Body.nextGroup(false)` to ensure `collisionStart` between beads can fire.
- Resting physics (“dead chain”):
  - `restitution: 0.0`
  - `frictionAir: 0.06`
  - `friction: 0.5`

### C) Anti-stretch correction pass (absolute distance correction)
- Implemented inside `onBeforeUpdate` after tether forces:
  - deterministic iteration over `correctionEdges[]` in the same order constraints were created
  - correction gate:
    - `CORR_ERR_THRESH = 2.5` px (skip small errors)
  - correction scale:
    - `CORR_K = 0.06`
  - velocity damp after correction:
    - multiply both bodies’ velocities by `0.85`

### D) Containment (offscreen drift prevention)
- Implemented inside `onBeforeUpdate`:
  - `margin = 20`
  - clamp `position` to `[margin+r, width-margin-r]` and `[margin+r, height-margin-r]`
  - outward velocity component is zeroed per axis
  - `maxSpeed = 25` (velocity magnitude cap with uniform scale)

### E) Always-on velvet tether
- Converted from magnetism-only “home forces” to:
  - always-on weak tether `K_REST = 0.0007`
  - magnetism boost `K_MAG = 0.025`
- Uses `body.home` (stored per body) to avoid index-order mismatches against `Composite.allBodies()`.

---

## Phase 2 — Technical Implementation Notes (Implemented Audio Graph + Wiring)

### A) New deterministic offline organ generator
- Added `src/utils/audioConstants.js`:
  - Equal-temperament chord roots per mystery (`VoxRadix`).
  - `smoothstep`, `clamp01`, `quantizeToChord`, `getChordFrequencies`.
  - Deterministic nearest-neighbor quantization to chord tones.

- Added `src/audio/CosmicResonator.js`:
  - Persistent Web Audio graph: oscillators + GainNodes + Biquad filters + Delay reverb (no samples, no convolver).
  - Cosmic base params computed once using `getCosmicPhases()`:
    - `subFreq = 32 + pluto*16`
    - `cutoffBase = 450 + saturn*120`
    - `reverbTail = 0.35 + neptune*0.35`
    - `breathHz = 0.05 + mercury*0.20`
    - `resonance = 1.0 + jupiter*4.0`
    - `shimmer = uranus*0.012`
  - Mobile cabinet rattle guard:
    - high-pass filter at `65Hz` when user agent matches mobile; otherwise `20Hz`.
  - SanctusFlush chord guard (inside `setMystery()`):
    - feedback gain (`SeculaSeculorum`) is driven to `0.0` for `50ms`, then restored to base.

### B) Event-driven parameter interpolation (no React audio ticking)
- `setProgress(p01)`:
  - updates persistent harmonic GainNodes via `setTargetAtTime`
  - opens the low-pass cutoff and Q smoothly
  - LFO depths updated only on prayer advancement events

- `setWarmth(w01)`:
  - soft master + cutoff swell during guided charging
  - wet wash gain blended for seamless ambience

- `chime(impactScalar, beadPhysicsType, beadIndex)`:
  - rate-limited to `60ms`
  - concurrency cap `<= 4` voices
  - impact controls chord tone selection + gain
  - routes chimes through the same LP/HP timbre path to blend with the organ

### C) Wiring into VirtualRosaryPhysics
- `src/components/RosarioNube/VirtualRosaryPhysics.jsx`:
  - replaces the old inline synth with a lazy `CosmicResonator` instance (`VoxOrganiRef`).
  - pointer down: `ensureVoxOrgani()` + `setWarmth(hit ? 0.3 : 0.1)`
  - pointer up: `silenceToHum()` (returns to tiny sacred hum)
  - `collisionStart`: forwards impact scalar to `VoxOrganiRef.chime(absForce, physicsType, index)`
  - `activePrayerIndex` change: calls `setProgress()` with `p=(active+1)/totalPhysicalBeads`.
  - `misterioActual` change: calls `setMystery()` to trigger SanctusFlush for chord safety.

