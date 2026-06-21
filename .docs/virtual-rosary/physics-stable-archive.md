# Physics-stable archive (Jun 2026)

**Path:** `src/components/RosarioNube/physics-stable/`  
**Status:** Not wired in production. Reference for topology + anti-jitter lessons.

## Separation of concerns

| Layer | Owns |
|-------|------|
| React (`VirtualRosaryPhysics.stable.jsx`) | Container ref, mount/unmount, callback refs |
| Matter (`physics-stable/`) | Engine, bodies, constraints, render, pointer input |
| Prayer model (`physicsRosaryData.js`, `RosarioPrayerBook`) | Liturgical indices, lone vs group beads |

Never create Matter bodies inside React. Entry: `runMatterRosary()` / exit: `destroy()`.

## Intentional fixes (keep when merging)

- No per-frame position nudging — removed `beforeUpdate` distance correction (jitter source)
- No home-position tether — free drag + empty-space pan
- Lone vs group constraints via `src/data/rosaryTopology.js` (`tight_link`, `long_chain`, `short_chain`)
- Medal ports: loop start → `medal_port_right`, loop end → `medal_port_left`
- Idempotent `destroyMatterRosary.js`

## Why archived (UX regressions)

- Cursor-body drag replaced `MouseConstraint` (weak feel)
- Matter.Render solid fills — prayer text not readable through beads
- `CosmicResonator` / `soundEnabled` not wired
- `afterRender` + `findIndex` per constraint every frame (perf)

## Prayer progress

Uses `beadData.index` = liturgical index from `RGo`/`RDo`/etc., not body creation order.

- Lone beads (`role: 'lone'`, mysteries, opening Our Fathers): `long_chain`
- Decade Hail Mary clusters: `tight_link`
- Medal/tail: `rosaryTopology.js`

## Tuning (`rosaryConfig.js`)

| Param | Default | Note |
|-------|---------|------|
| `constraint.stiffness` | 0.4 | Higher = stiffer, more jitter risk |
| `constraint.damping` | 0.8 | Higher = less oscillation |
| `bead.frictionAir` | 0.12 | Higher = settles faster |

If jitter: lower stiffness or raise damping — do **not** add per-frame nudges.

## Module files

- `runMatterRosary.js` — entry
- `createWorld.js`, `createBeads.js`, `createConstraints.js`, `createEngine.js`
- `rosaryConfig.js`, `destroyMatterRosary.js`
