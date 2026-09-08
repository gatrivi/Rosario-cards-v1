# Handoff — 2026-09-05 — Production Matter.js rosary interaction audit

Stack: `RosarioVirtualView.jsx` → `RosaryAdapter.jsx` (= `VirtualRosaryPhysics.jsx` re-export) → `InteractiveRosary.jsx` + `hooks/useRosaryDragging.js`, `hooks/useBeadInteraction.js`, `utils/canvasPointer.js`.
No code changed in this session. Physics untouched.

## Problems reproduced (code-level)

1. **Cross tap is dead.** `InteractiveRosary.jsx:1180-1195` (`mousedown` bead handler) does `allBeads.find(b.id === clickedBody.id)`. The cross is a composite (`:888-899`); Matter reports a part, id never matches, handler returns early. Rule broken: cross → Sign of the Cross (`interaction-rules.md` #5).
2. **Chain-mode branch unreachable (string vs numeric id).** `useBeadInteraction.js:47-48` sets `pressSameBeadId`/`chainBeadHighlight` to `` `chain-${prayerIndex}` `` strings; `:24-26` sets `` `next-${i}` `` strings. `InteractiveRosary.jsx:1362-1365` compares them to numeric Matter `bead.id`. Never equal → 2nd+ taps always fall through to `beadRepeatTouch` (`:1434-1450`).
3. **Repeat-tap both enters chain mode AND advances.** `RosarioVirtualView.jsx:232-268` (`onRepeatTouch`) dispatches `enterChainPrayers` then unconditionally `contentExhausted` (`:265-267`) → `handleAdvance` (`:174-200`). Chain prayers (G/F) get skipped/duplicated vs the internal `onBeadClickRef(chainIdx)` path (`InteractiveRosary.jsx:1390`).
4. **Any empty quick-tap advances.** `InteractiveRosary.jsx:1532-1557` (`mouseup` empty branch): `dist<30px, dur<400ms` → `cb.onAdvance()` with no swipe. Conflicts with pan/read; hint only promises swipe.
5. **Stale tail-glow indices.** AfterRender (`:2015-2020`) hardcodes glow for prayerIndex 5/6/9, but redirect map `tailToClosingMap` (`:1171-1178`) is dynamic over `closingPrayers` (currently LL,S = 2 entries). Cue ≠ behavior.
6. **Pan blocked near chains.** `isPointerOnBead` (`:232-236`, radius 28) includes invisible chain beads → empty-space pan (`useRosaryDragging.js:29-30,87-90`) refused in a 28px halo around chain midpoints.

## Relevant tests

- Keep: `VirtualRosaryPhysics.test.js` (adapter defer gate + unlock wiring), `rosarySequenceUtils.test.js` (gates), `canvasPointer.test.js` (hit-test).
- Ignore for prod path: `rosaryPhysicsStable.test.js` (archived `physics-stable/` only).
- Missing: cross-part → index 0; chain highlight round-trip; empty-tap no-advance; repeat-touch single-dispatch.

## Smallest proposed fixes (no refactor, next session)

1. Cross: resolve `clickedBody.parent` (or tag `crossParts` with `prayerIndex: 0`) before lookup (`:1191-1195`).
2. Chain ids: store/compare prayerIndex (or numeric body id) in `useBeadInteraction` instead of `` `chain-${i}` `` / `` `next-${i}` `` strings.
3. Repeat-touch: only dispatch `contentExhausted` when NOT entering chain prayers (`RosarioVirtualView.jsx:257-267`).
4. Empty tap: delete `dist<30/dur<400 → onAdvance` branch (`:1550-1556`); keep swipe + hold-charge.
5. Tail glow: derive glow set from `tailToClosingMap`/`closingPrayers`, not `5,6,9`.
6. Add 4 tests listed above.
