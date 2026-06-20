# Canonical rosary topology (reference)

## Production (Rosario view)

[`InteractiveRosary.jsx`](InteractiveRosary.jsx) from `origin/master` builds a 60-bead Matter world inline and maps each bead to a **liturgical index** via `RosarioPrayerBook` sequences (`RGo`, `RDo`, …) through [`hooks/useRosarySequence.js`](hooks/useRosarySequence.js).

## Future canonical graph

[`src/data/rosaryTopology.js`](../../data/rosaryTopology.js) + [`physicsRosaryData.js`](../../data/physicsRosaryData.js) define the **61-node** v4 blueprint with medal port fixes. Implemented in [`physics-stable/`](physics-stable/) for reference.

When merging fully, replace InteractiveRosary inline constraint creation with `buildRosaryEdges()` + `getRosaryBeads(misterioActual)` while keeping master's `afterRender` visual style.
