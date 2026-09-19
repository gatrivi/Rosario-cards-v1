# Handoff 2026-09-09 — Rosas que Recuerdan (v0.3.84): context-aware rose fingerprints

Companion to `handoff-2026-09-04-rosa.md`. That handoff's gesture, verse-drawing,
resume, and counting contracts are all preserved — this session only ADDED data
to fingerprints and one optional render modulation. Local only, not deployed.

## Problem

Roses earned from Libro (`BookletView`) and the physics rosary
(`RosarioVirtualView`) came from `makeBookletRoseFingerprint`, a pure function of
(ave position, decade). Same step → same rose, every day, on every device.
Only `/rosa` (RoseView gestures) produced truly individual roses. Manual records
were bare `{ timestamp, source: 'manual' }`.

## Schema (additive — nothing existing was removed)

`src/utils/roseFingerprint.js` (new) — `createRoseFingerprint` returns:

```js
{
  timestamp,            // seed, unchanged role
  source,               // 'rosa' | 'libro' | 'rosario' | 'manual'
  warmthProfile, wiggleProfile,  // legacy 12-path arrays, still populated
  verseCount,           // 10 for libro/rosario/manual
  verseTraits: { warmth, wiggle },
  context: {
    source, dwellMs,    // dwell = Ave María step on-screen time (30 min cap)
    hour, daylight,     // band id: madrugada/amanecer/manana/mediodia/tarde/atardecer/noche
    mysteryDecade,      // ongoing decade (getOngoingMysteryDecade — Aves now know their mystery)
    guided,             // rosary Guiado/Libre; null elsewhere
    avePosition, aveTotal,
  },
}
```

`storeRoseData` (useAveMariaStats.js) whitelists `context` now; old stored roses
without it are untouched and render exactly as before (VerseDrawing's context
ink is gated on `rose && context`).

## Who measures what

| Surface | source | Measured | Traits derivation |
| --- | --- | --- | --- |
| `/rosa` RoseView | `rosa` | per-verse gesture warmth/wiggle (unchanged) | + context: dwell of the prayer, hour |
| `/libro` BookletView | `libro` | `stepShownAtRef` dwell per step | warmth from dwell (`dwellCalm`), tiny seeded wiggle |
| `/rosario` RosarioVirtualView | `rosario` | same dwell + Guiado/Libre flag | slightly livelier wiggle; Libre breathes more |
| MacetonView manual entry | `manual` | nothing fabricated | calm near-still traits, muted ink; daylight-only variation |

Dwell → warmth mapping: `log(seconds+1)/log(1801)` (30 min → 1), base
`0.18 + calm*0.62`; unmeasured defaults to a steady-minute 0.45.

## Rendering

`VerseDrawing` takes `context` (forwarded by `RoseDrawing`, passed by both
MacetonView and JardinDeRosasView): daylight band shifts petal hue/sat/light
(subtle ±16 max — roses stay roses), dwell widens/softens strokes, `manual`
mutes saturation, `rosario` multiplies expansion noise ×1.5. Deterministic:
derived only from stored fields + seed; no Math.random, no render-time clock.
Garden tooltips show `describeRoseContext` (e.g. "al atardecer · libro · 2 min").

Backward-compat guarantees (tested): without `context`, VerseDrawing output is
byte-identical to the previous formula for rose AND symbol drawings; non-rose
symbols ignore context entirely; `makeBookletRoseFingerprint` keeps its
two-argument signature working.

## Counting unchanged

Still only Ave María (id A) increments; rosa guards (`countedRef`), novena and
Sagrado Corazón exclusions in AppShell's `onAveMariaComplete` untouched. Undo
paths (`onAveMariaUndo` → `popRoseData`) untouched.

## Verification

- Full jest: 52 suites / 291 tests pass (includes new `RoseFingerprint.test.js`
  and extended `VerseDrawing.test.js`).
- ESLint clean on all touched source files. `VerseDrawing.test.js` carries
  pre-existing `testing-library/no-container` errors by file convention —
  19 existed before this session; new assertions follow the same SVG-attribute
  idiom rather than adding a different violation class.
- NOT yet verified in a running browser (rosa suite's manual acceptance steps
  from the 09-04 handoff still apply). Existing local dev servers from earlier
  sessions are session resources; restart if needed.

## Cheap regression command

```powershell
npm test -- --watchAll=false --runInBand --runTestsByPath src/__tests__/RoseFingerprint.test.js src/__tests__/VerseDrawing.test.js src/__tests__/ManualPrayerEntry.test.js src/__tests__/RoseDrawingProgress.test.js src/__tests__/RoseView.test.js src/__tests__/RoseViewInteraction.test.js
```
