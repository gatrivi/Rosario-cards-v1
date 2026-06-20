# Matter.js Rosary Physics

## Separation of concerns

| Layer | Owns |
|-------|------|
| **React** (`VirtualRosaryPhysics.jsx`) | Container ref, mount/unmount, callback refs, active prayer index |
| **Matter** (`physics/`) | Engine, bodies, constraints, runner, render, pointer input |
| **Prayer model** (`physicsRosaryData.js`, `RosarioPrayerBook`) | Canonical sequence, liturgical indices, lone vs group beads |

**Never create Matter bodies inside React.** React calls only `runMatterRosary()` on mount and `destroy()` on unmount.

## Prayer order

Progress uses `beadData.index` — the **liturgical index** from the canonical rosary sequence (`RGo`, `RDo`, etc.), not body creation order.

- **Lone beads** (`role: 'lone'`, mysteries `MG*`, `MD*`, `ML*`, opening Our Fathers): longer constraints (`long_chain`)
- **Group beads** (Hail Mary decades): tight constraints (`tight_link`)
- **Medal / tail**: separate topology via `rosaryTopology.js`

Anchor, cursor, and sensor bodies do not affect prayer progress.

## Tuning constraints safely

Edit [`rosaryConfig.js`](./rosaryConfig.js) only:

- **`constraint.stiffness`** (default `0.4`) — higher = stiffer chain, less sag, more jitter risk
- **`constraint.damping`** (default `0.8`) — higher = less oscillation
- **`bead.frictionAir`** (default `0.12`) — higher = rosary settles faster when untouched
- **`constraint.longGap`** — space after mystery / before decade cluster
- **`constraint.tightGap`** — space between Hail Mary beads

If beads jitter: **lower stiffness** or **raise damping** — do not add `beforeUpdate` position nudges.

If the loop sags too much: raise stiffness slightly (e.g. `0.45`), not per-frame correction.

## Free movement

There is **no home-position tether**. Users drag individual beads (cursor constraint) or pan empty space to move the whole rosary. `frictionAir` lets it rest calmly without snapping back.

## Files

- `rosaryConfig.js` — tunables
- `createEngine.js` — Matter engine
- `createBeads.js` — initial layout from `getRosaryBeads`
- `createConstraints.js` — chain from `buildRosaryEdges`
- `createWorld.js` — assembles world + invisible cursor body
- `runMatterRosary.js` — entry point
- `destroyMatterRosary.js` — idempotent teardown
