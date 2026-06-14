# Dev Notes: Complete DOM “Rosary with Physics” Prototype (condensed)

Goal: build an interactive rosary chain with draggable beads, fixed-length constraints (“threads”), basic collisions, and per-impact sound—starting in DOM and migrating to Canvas/ Matter.js for performance.

## Component architecture
- `Bead`: draggable circle DOM element
  - registers `mousedown`/`touchstart`
  - on move emits position updates
- `BeadChain`:
  - owns array of bead state: `[{id, x, y, vx, vy}]`
  - applies:
    - constraint resolution (“threads” as distance targets)
    - inertia via RAF updates with friction
    - collisions (start with adjacency for efficiency)
    - audio playback per impact
  - renders:
    - beads
    - SVG thread lines between successive beads (and loop closure if circular)
- `Rosary`:
  - generates initial layout:
    - main loop beads placed on an arc/circle
    - tail beads placed in a separate strand
  - composes multiple `BeadChain` segments

## Constraint model (“thread”)
- Use distance target `THREAD_LENGTH`.
- After moving a bead:
  - compute dx/dy/dist between constrained pair
  - if `dist > THREAD_LENGTH`, reposition both beads along the vector to restore target distance.
- Complexity control:
  - apply constraints only to local neighbor pairs (chain adjacency).

## Collision model (prototype)
- Start with adjacent collision checks:
  - per RAF/frame for chain neighbors, if `dist < 2 * BEAD_RADIUS`, treat as collision.
- Collision response (simple prototype):
  - swap/invert velocities for the colliding neighbors
- Loop collision:
  - if circular, also check last-first pair.

## Sound on collision
- Web Audio oscillator per collision event.
- Make sound variable by:
  - relative speed/impact magnitude
  - collision order index
  - mapping impact to oscillator choice (or playbackRate).

## Scaling guidance
- DOM physics becomes expensive quickly; collision checks can trend toward O(n²).
- For many beads:
  - keep collision tests local (adjacent/culling) as an interim optimization
  - when needed, migrate:
    - render to Canvas (better perf for many nodes)
    - physics to Matter.js (robust constraints + collision pipeline)

