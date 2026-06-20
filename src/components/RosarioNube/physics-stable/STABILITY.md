# Physics-stable archive (Jun 2026 refactor)

Reference implementation extracted from React. **Not wired into the main app** after Rosary UX Recovery — kept for topology and jitter lessons.

## Intentional fixes (keep when merging)

- **No per-frame position nudging** — removed `beforeUpdate` distance correction pass (jitter source).
- **No home-position tether** — free movement; users drag beads or pan empty space.
- **Lone vs group constraints** via `src/data/rosaryTopology.js` (`tight_link`, `long_chain`, `short_chain`).
- **Medal port wiring** — loop start → `medal_port_right`, loop end → `medal_port_left`.
- **Idempotent teardown** — `destroyMatterRosary.js`.

## What regressed (why we archived)

- Cursor-body drag replaced `MouseConstraint` (weak feel).
- Matter.Render solid fills — no semi-transparent beads over prayer text.
- `CosmicResonator` / `soundEnabled` not wired.
- `afterRender` + `findIndex` per constraint every frame (perf).

## Files

- `runMatterRosary.js` — entry point
- `createWorld.js`, `createBeads.js`, `createConstraints.js`, `createEngine.js`
- `rosaryConfig.js` — tunables
- `destroyMatterRosary.js`
- `README.md` — separation-of-concerns notes

## Shell

`VirtualRosaryPhysics.stable.jsx` — thin React wrapper that called `runMatterRosary()`.
