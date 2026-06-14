# Dev Notes: DOM Draggable Beads Prototype

Purpose: prototype interactive “beads + thread + simple collision + audio” using only React + native DOM events, then scale with a physics library if needed.

## Assumptions / primitives
- Base components:
  - `Bead`: draggable circular DOM element
  - (optional) thread rendering: SVG line
- State model during prototyping:
  - positions in app/component state
  - optionally velocities if adding bounce

## 1) Draggable bead (mouse + touch)
Event flow:
- start: `mousedown` / `touchstart`
- move: `mousemove` / `touchmove`
- end: `mouseup` / `touchend`

Key implementation details:
- track pointer offset at drag start (pointer client coords minus bead element top/left)
- on move: call `onMove({x,y})` with pointer minus offset
- cleanup: remove listeners on end/unmount
- mobile: use `{ passive: false }` + `preventDefault()` to stop scroll during drag

## 2) Connecting beads with a “thread”
- visual: SVG `<line>` between bead centers
- logic (prototype): treat thread as fixed distance constraint; when one bead moves, adjust the other along the vector to preserve target distance.

Simplification:
- compute dx/dy/dist
- if dist exceeds target, apply ratio to shift the pair back to target distance

## 3) Add basic collisions (prototype)
Collision test:
- per frame (e.g., inside RAF loop), compute pairwise distance
- if `dist < collisionThreshold`, treat as collision

Bounce prototype:
- store per-bead velocity `{vx,vy}`
- on collision: swap or invert velocities (adjacent beads for simplicity)

## 4) Add sound on collision (Web Audio)
Minimal synth:
- create audio context
- on collision: create oscillator (e.g., sine at ~440Hz), connect to destination, stop shortly

Variable collision sound:
- modulate oscillator frequency based on relative speed/impact

## 5) Scale up (recommended migration points)
- Replace manual drag with `react-draggable` when available.
- For physics correctness:
  - migrate bead interactions to Matter.js (`matter-js`)
  - create engine, circular bodies, constraints for “thread”
  - handle `collisionStart` events to trigger audio

Performance notes:
- for many beads, avoid O(n²) collision checks; use adjacency/culling strategies first, then move to Matter.js for robust physics.

