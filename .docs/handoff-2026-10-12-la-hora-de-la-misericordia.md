# Handoff 2026-10-12 — La Hora de la Misericordia (v0.3.88)

Local only: not committed, not deployed. 60 suites / 409 tests green.
Read `handoff-2026-09-04-rosa.md` first; this one adds to its gesture contracts
and supersedes it where they differ (Amén, verse completion).

## What shipped locally

1. **Devotions shelf** — Santa Faustina's Corona and Novena are two separate
   thumbs (`SHELF_RECORRIDOS` in `BookletView.jsx`). `FaustinaMercyThumb.jsx` is
   now unused; its CSS still serves `StationsDevotionThumb`.
2. **Divine Mercy chaplet in the Rosa** — `/rosa?devocion=misericordia`, link in
   the Rosedal next to Patrick. 64 steps built from `RDM_KEYS`.
3. **Rosa drag made consistent** (owner: "el arrastre no es consistente").
4. **Amén needs one pass** (owner: "Amén requiere dos pases, bug").
5. **Rosa responsiveness** (owner: "el progreso se ve mucho después").
6. **Two hymns completed** in the Sagrado Corazón adoration.

## Rosa devotions

- `ROSE_DEVOTIONS` / `isRoseDevotion` in `roseViewHelpers.js`. `getSequenceData(mystery, devotion)`
  branches on the id; the chaplet reuses `divineMercyPrayers` + `resolveMercyStepImage`,
  so every step has `img` + `imgCandidates`.
- AppShell keeps one cursor per devotion in `localStorage['rosario_rose_devotion_index']`.
  It never touches `rosaryIndex` or cloud sync.
- **No devotion counts roses**, not even its Ave María (`rezoData.id === 'A' && !devotion`).
  The opening Ave still draws a rose; it is not stored.
- Finishing a multi-step devotion clears its `roseSession` snapshots, rewinds the
  cursor to 0 and calls `onBack()` (Rosedal).
- New symbol `mercy_heart` (heart, halo, cross, two rays) for `MP`, `DMO1`, `DMO2`.
  `EF` → `luminoso_5`, `HG` → `crown`. **Nobody has looked at the heart on a phone yet.**
  Both rays take the same ink: VerseDrawing colours by traits, not per path.

## Gesture rules added (all in `RoseView.jsx`)

Margins are unchanged (12 px above, 56 below, 24 sideways). On top of them:

- Unread letters use the same metrics as read ones (`SacredText.jsx`). Before, the
  line reflowed under the finger at the first touch.
- Trailing punctuation rides with the last letter (`charInWordAtPointer`).
- Lifting inside the last word of a line finishes that line; on the last line it
  completes the verse and advances after 250 ms.
- Running off the right end of the line being read finishes it (`findLineEndWord`).
- The line being read wins over the line under a low thumb (`findWordAtPointer`),
  except a direct hit on the very next word.
- A new line is entered only at its first words, so a finger travelling back to
  the left does not light the line it crosses.
- A drag that starts just outside the letters and sweeps across them cancels the
  hold timer. Pill and thumb-zone presses stay hold gestures.
- A one-word verse already lit by the hold timer can still be completed by touch.

## Amén

Completing the last verse completes the prayer. It stays lit for
`PRAYER_COMPLETE_BEAT_MS` (700 ms) and then `advancePrayer()` runs by itself; a
touch during the beat advances on release instead. A completed prayer shows its
own last verse — the view no longer invents an "Amén." for prayers without one.
Rose counting still happens only in the `isPrayerComplete` effect.

## Responsiveness — do not reintroduce per-frame work

The main thread was busy even with nobody touching the screen, so pointer events
queued. Measured in Chrome with emulated touch and CPU throttling (not on a phone):

| | Before | After (dev) | After (prod build) |
|---|---|---|---|
| Idle main thread, desktop 1x | 13 % | 5 % | — |
| One stroke at CPU x6 (ideal 3.6 s) | 4.3 s | 3.7 s | 3.5 s |
| One stroke at CPU x10 | 6.3 s | 5.0 s | 4.3 s |

- `SacredDust.jsx`: no canvas resize or gradients per frame; ~20 fps, timer-paced.
  Also used by `RosarioVirtualView`.
- Letter warmth tick lives in `SacredText`; RoseView's own tick is 250 ms.
- Word/letter boxes are measured once per gesture (`rectCacheRef`).
- `pray-for-orb-breathe` (app-wide orb) and `pulse-first-letter` are stepped.
- The dev server runs ~3x more script than a production build. Judge feel on a
  production build.

`window.__roseDebug = true` in the console turns on RoseView logs.

## Hymns

`sagradoCorazonAdoracionData.js`: "Cantemos al Amor de los amores" (three stanzas
+ refrain, as in the parish booklet in `sagrado_corazon_cursor_source_notes.md`)
and "Laudate omnes gentes" (Psalm 117, 1 + Spanish) replace the
"letra pendiente por derechos" placeholders; both flagged `public-domain`.

## Matter.js rosary and audio — investigation (owner: "hace falta mucho trabajo")

The owner gave no specifics, so this is what an emulated-touch pass found. Only the
first item was fixed; the rest is measured but untouched.

**Fixed — the Matter rosary was silent.** Commit `e0b4889` (gesture rework) removed
every deliberate sound call; only bead-collision ticks were left, so tapping a bead
made no sound. Before the fix, a bead tap created 0 oscillators; now it rings.
- `RosarioVirtualView.jsx` plays `playBookletTransitionSound` (the Libro's chime, on
  the shared `audioManager` context) whenever the prayer index changes — bead tap,
  repeat touch, guided advance, medal jump. Not on mount, not on inner verse steps.
- `InteractiveRosary.jsx` calls `audioManager.resume()` inside its two pointer-down
  handlers so the shared context is unlocked from a user gesture.
- `soundEffects.initAudioContext()` now resumes a context the browser suspended.
- Test: `RosarioVirtualProgression.test.js` ("entering a prayer rings the step chime").

**Added — double tap to zoom (owner request).** A double tap on empty space zooms the
Matter rosary to `THUMB_ZOOM` (2.5x: an 8 px-radius bead becomes a ~40 px target)
around the tapped point; a second double tap restores the zoom and position the user
had before. Taps that land on a bead or chain never zoom — they stay prayer
selection. Desktop: double click. All in `InteractiveRosary.jsx` (`toggleThumbZoom`,
`noteTapStart`/`noteTapEnd`); the glide is the `interactive-rosary--zooming` class in
`InteractiveRosary.css`, present only while the toggle settles so pan and pinch stay
1:1. Remember the container never moves — only its canvas is transformed via
`--rosary-pan-x/y` and `--rosary-zoom`. At 2.5x the 1x canvas looks pixelated (see
below). Test: `InteractiveRosaryGestures.test.js`.

**Found, not fixed:**
- **Sound is off by default.** `index.js` writes `rosario_sound_enabled = 'false'` on
  first run (audio is opt-in). A new user hears nothing anywhere until they turn it
  on. Intentional, but it reads as "audio is broken".
- **Dead sound engine.** `soundEffects.js` (786 lines) defines eight chimes
  (`playPrayerChangeSound`, `playChainPrayerChime`, `playMoveToNextBeadChime`, …) and
  none is called anywhere. Only `initAudioContext`, `setEnabled` and
  `getMysterySoundPalette` are used. `setMystery` is never called either.
- **Two AudioContexts.** `soundEffects` creates its own; everything else shares
  `audioManager`'s. The Matter screen runs both.
- **The Matter screen is heavy while idle.** Its two rAF loops (Matter `Render.run`
  with ~800 lines of `afterRender` drawing, 22 `shadowBlur` uses, plus `Runner.run`)
  cost ~6 % of a desktop main thread with nobody touching; the whole screen idled at
  28 % in the trace (the Rosa idles at 5 % after today's work). On a phone that is
  enough to saturate it. Nothing sleeps when the rosary is at rest.
- **The canvas renders at 1x.** `Matter.Render.create` sets no `pixelRatio`, so beads
  are soft on a 2–3x phone screen. Raising it multiplies the pixels drawn per frame,
  so fix the idle cost first.
- **Console noise:** "Unable to preventDefault inside passive event listener" on every
  touch move, from Matter 0.20's own touch listeners. Harmless (the canvas has
  `touch-action: none`) but it buries real errors.
- Still open from 2026-09-06: chains are hard to see and select.

Rule from the earlier handoffs still holds: reproduce a concrete defect before
changing `InteractiveRosary.jsx` (2380 lines, carefully tuned).

## Open
- Bundled guide voice for `SCA_HYMN_CANTEMOS` and `SCA_HYMN_LAUDATE` was recorded
  from the old placeholder text; regenerate it.
- The source notes still carry the rule "si el canto puede tener copyright, no
  publicar letra completa". Remove it or the placeholder may come back.
- Coraza de San Patricio is still the ten-verse excerpt (ten shield contours).
- Corona's shelf thumb is the same image as Sagrado Corazón's; a Divine Mercy
  image would separate them.
- None of this was verified on a real phone.

## How it was verified

Emulated touch via `playwright-core` driving the installed Chrome over CDP
(`Input.dispatchTouchEvent`), phone viewport, against `npm start`. Scenarios: on
the letters, stopping short, overshooting, starting outside the text, thumb below
the line, zig-zag across two lines without lifting. The probe scripts lived in the
session scratchpad and were not kept in the repo.

Dev server for the phone: plain `npm start` (port 3000), reachable over Tailscale.
