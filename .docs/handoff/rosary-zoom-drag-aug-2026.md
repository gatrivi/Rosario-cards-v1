# Handoff — Rosario view zoom & bead drag (Aug 2026)

**Version:** v0.3.64 (base)  
**Branch:** `cloud-rosary-v2`  
**Prod:** https://rosario.gatrivi.com

## User request (original)

1. Rosario view: zoom (pinch mobile, mouse wheel web); OK if only part of rosary visible.
2. Dragging a bead should move that bead on the string — not the whole rosary as one block (regression).

## Shipped on `cloud-rosary-v2`

### PR #13 — MERGED (`5b011a3`)

| File | Change |
|------|--------|
| `src/components/RosarioNube/utils/canvasPointer.js` | Screen → canvas coords (CSS stretch fix) + region hit-test |
| `src/components/RosarioNube/hooks/useRosaryDragging.js` | Skip pan when pointer on bead or Matter drag active |
| `src/components/RosarioNube/InteractiveRosary.jsx` | Wheel zoom, `beadPhysicsDragRef`, wider clamp 0.5–2.5 |
| `src/__tests__/canvasPointer.test.js` | Coord scaling tests |

**Bead-drag root cause:** `isPointerOnBead` used raw `getBoundingClientRect` without `canvas.width/rect.width` scale → missed beads → wrapper CSS `translate` panned entire rosary.

**Squash merge:** GitHub housekeeping only; no features removed in that PR (+110/−9 lines).

## Open — needs merge

### PR #14 — DRAFT (`cursor/rosary-viewport-zoom-639a`)

**Problem:** Wheel/pinch still re-inited Matter on every step because `rosaryZoom` was in `initializePhysics` deps and sized beads at init.

**Fix:** Physics at base sizes always; zoom = CSS only:

```js
transform: `translate(${x}px, ${y}px) scale(${rosaryZoom})`
```

`rosaryZoom` removed from `initializePhysics` dependency array.

**Verify after merge:**
- [ ] Wheel zoom: smooth, beads stay put, no flash
- [ ] Pinch zoom: same on mobile
- [ ] Ajustes S/M/L/XL: scales visually, no physics reset
- [ ] Bead drag: individual bead on string (not whole-rosary pan)
- [ ] Empty-space drag: still pans whole rosary

## Architecture (do not break)

```
RosarioVirtualView → RosaryAdapter → InteractiveRosary
```

- **Bead drag:** Matter `MouseConstraint` on canvas
- **Empty pan:** `useRosaryDragging` CSS `translate` on `sceneRef`
- **Zoom:** CSS `scale` on `sceneRef` (after #14) — NOT physics re-init
- Sacred stack: see `.docs/virtual-rosary/rosary-ux-recovery-jun-2026.md`

## Key locals / events

| Key / event | Purpose |
|-------------|---------|
| `localStorage.rosaryZoom` | Viewport zoom level |
| `rosaryZoomChange` | Sync `useRosaryState` + Settings presets |
| `localStorage.rosaryPosition` | Pan offset |

## Not in scope / deferred

- Zoom toward cursor (wheel anchor point)
- `physics-stable/` path — archive only; live path is `InteractiveRosary.jsx`
- Two-finger rotate ("spin") — not requested; pinch = zoom

## Commands

```bash
npm test -- --watchAll=false --testPathPattern="canvasPointer|VirtualRosary|rosaryPhysics"
```

## Next agent

1. Merge PR #14 if wheel still re-inits on deployed build.
2. Manual test on phone + desktop.
3. If zoom feels laggy: optional local `viewZoom` state + debounced `localStorage` (wheel currently goes event → `useRosaryState` → re-render style only — should be fine post-#14).
