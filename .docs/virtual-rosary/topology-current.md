# Rosary topology — current vs canonical

## Production (Rosario view)

`InteractiveRosary.jsx` (from `origin/master`):

- ~60 beads, inline Matter world build
- Each bead maps to **liturgical index** via `RosarioPrayerBook` sequences (`RGo`, `RDo`, …)
- Sequence hook: `hooks/useRosarySequence.js`

## Canonical v4 blueprint (future merge target)

| Source | Purpose |
|--------|---------|
| `src/data/rosaryTopology.js` | `buildRosaryEdges()` — medal ports, link classes |
| `src/data/physicsRosaryData.js` | `getRosaryBeads()` — 61 nodes, liturgical indices |
| `src/data/rosary_blueprint.json` | JSON spec mirror |
| `physics-stable/` | Reference implementation using v4 graph |

**Merge plan:** Replace InteractiveRosary inline constraints with `buildRosaryEdges()` + `getRosaryBeads(misterioActual)`; keep master's `afterRender` visual style (alpha, glow, chain strokes).

## v4 metadata (from RosaryStructure)

- Total beads: 59–61 (cross + medal + decades + tail)
- Lone beads: 6 (2 tail, 4 loop)
- Decade beads: 50
- Link types: `tight_link`, `long_chain`, `short_chain`

Full JSON: see [physics-blueprint-v4.md](./physics-blueprint-v4.md).
