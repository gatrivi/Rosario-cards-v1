# Rosa and verse drawings — handoff, 2026-09-04

Read this before changing Rosa, its SVGs, resume behavior, or garden recording.
This supplements the architecture docs and supersedes older Rosa interaction descriptions.

## Delivery state

- Local working-tree implementation; **not committed, pushed, or deployed in this session**.
- Badge remains **v0.3.82 — El Rosal Reparable**. It does not identify these local changes.
- Phone preview: http://100.87.252.18:6660/rosa through Tailscale.
- Breastplate: http://100.87.252.18:6660/rosa?devocion=patrick.
- Port 6666 was requested and started, but Chromium returned ERR_UNSAFE_PORT. Use 6660.
- Dev processes are session resources; verify they are still running.
- Preserve existing unrelated WIP. AppShell overlaps our Patrick wiring with pre-existing
  Reliquario changes. Booklet, optional prayers/sheet, imageRegistry, routes, scripts,
  Reliquario files/tests, and ui-ux-principles.md already had user changes.
  Do not stage the entire tree, reset it, or attribute all its changes to this session.

## User priorities

- Prayer directs awareness. The finger guides the text; the drawing rewards each verse.
- Two modes: drag text (including forgiving space below it), or hold outside the text.
- No competitive judgment: a fast stroke is different, not spiritually worse.
- Budget-conscious work: small patches, local scripts, focused tests, compact tool output.
  Do not start agents unless explicitly requested. Do not refactor the monolith wholesale.
- User confirmed drag and widened targets work well, and liked the verse drawings.
- Deferred explicitly: Amén polish, hold-button animation overpowering prayer text,
  voice/TTS-driven fingerprints. Do not mix these into unrelated work.

## Files and responsibilities

| File under src/ | Responsibility |
| --- | --- |
| components/Views/RoseView.jsx | Existing gesture, verse, audio, completion controller |
| components/Views/SacredText.jsx | Letter illumination |
| components/Views/roseViewHelpers.js | Shared sequence data; optional Patrick branch |
| components/Views/VerseDrawing.jsx | New normalized SVG renderer + verseSegments helper |
| components/Views/RoseDrawing.jsx | Existing rose artwork; new renderer when verseTraits exists |
| components/Views/SacredDrawing.jsx | Same bridge for other symbols |
| data/SacredSymbols.js | Symbol paths and PATRICK → patrick_shield mapping |
| components/Views/roseSession.js | Tab-session resume snapshots |
| components/Views/ManualPrayerEntry.jsx | Register prayer completed outside the app |
| components/Views/MacetonView.jsx | Production Rosedal, return link, manual entry, Patrick link |
| components/Views/JardinDeRosasView.jsx | Full garden |
| hooks/useAveMariaStats.js | Counts and saved fingerprints, now accepts batched fingerprints |
| components/Layout/AppShell.jsx | Parent prayer index and Patrick query isolation |

The legacy components/Rosedal/RosedalView.jsx is NOT the production /macetones screen.
Do not fix the wrong component.

## Gesture contracts — do not regress

1. Pointer movement only reads while isPointerDownRef is true.
2. Text dragging advances by the actual letter rectangle / pointer x coordinate.
   It must not call the timed word throttle to approximate finger position.
3. A gesture starting in a text target sets pointerStartedInTextRef.
   The hold timer explicitly excludes this gesture. Otherwise it races the finger.
4. findWordAtPointer accepts 12 px above, 56 px below, and 24 px sideways.
   Choose the nearest rectangle among candidates; do not use the first match in a
   huge overlapping margin (the former 80 px margin selected earlier words).
5. The pill is marked data-rose-hold; its press must remain hold mode even if near text.
6. Text gestures cannot trigger vertical swipe verse-skipping when moving between lines.
7. Release after a completed verse advances. The isPointerDownRef release guard avoids
   duplicate pointerup/leave advancement. Preserve touch pointer capture/release.
8. The hold pill stays ABOVE BottomNav using --app-above-nav. Transparent nav still eats taps.
9. Reached letters remain visibly illuminated (minimum displayed warmth 200 ms).
   Previously zero-duration letters stayed dark while later letters glowed.
   Forward bleed is currently disabled. SacredText still contains an unreachable
   dist <= 0 bleed block after its earlier dist < 0 / === 0 returns; cleanup is optional,
   restoring forward illumination is NOT an equivalent cleanup.
10. RHYTHM_CONFIG must stay module-level and stable. A fresh object each render restarts
    the hold effect during warmth animation and can stop reading entirely.

Known limits: reverse dragging does not erase progress; dragging starts on movement,
not necessarily on pointerdown. The current controls are not a new multi-touch/pressure system.

## Verse drawings and fingerprint persistence

VerseDrawing splits the path timeline into exactly verseCount groups.
verseSegments(pathCount, verseCount, verseIndex) partitions contours without omissions:
a verse can contain several contours, or a portion of one contour. Normalized pathLength=1
and dash intervals reveal that portion. This is why new verse line breaks need NOT ruin the SVG.

Each group uses saved verse warmth and movement for color, width, rotation, and expansion.
A seed supplies deterministic variation. Layered ink gives a colored edge and fine highlight.
Completed groups do not depend on later progress. Compact garden mode crops the same drawing;
it must not redistribute its strokes or invent a new seed.

Important limits:
- Existing artwork was retained; this is not a complete redraw of every devotion.
- Traits currently derive from character dwell and sampled movement variability.
  No measured touch pressure, multi-finger intensity, or TTS traits were added.
- Live incomplete verses use fallback traits; recorded traits settle when a verse completes.
- Physical contour lengths are not equalized: subdivision is by path timeline.
- Some verse groups contain multiple SVG contours, not literally one uninterrupted pen stroke.

New fingerprints retain legacy fields and add:
```js
{
  timestamp, // also the deterministic drawing seed
  warmthProfile, wiggleProfile, verseCount, // legacy compatibility
  verseTraits: { warmth: [...], wiggle: [...] }
}
```
Do not drop verseTraits during save, sync, or garden rendering.
Both MacetonView and JardinDeRosasView pass timestamp as seed and the same verseTraits/count.
Old fingerprints without verseTraits still use the legacy renderer.

Only an Ave María (id A) increments roses automatically.
countedRef guards completion against counting again when a finished prayer resumes.
Verse profiles are indexed by verse, not blindly appended.
Never add count increments to drawing renders, warmth ticks, or pointermove.

## Resume and manual recording

AppShell owns the prayer index. RoseView no longer overwrites it from cloud data each mount.
roseSession saves on unmount/pagehide into sessionStorage:
rosa-reading-session-v1:<mystery-or-devotion>:<prayerIndex>.
Snapshot includes verse, letter, completion/activation flags, seed, dwell and verse profiles.
A return resumes idle, not actively holding. Initialization must not reset restored data.
Patrick and classic rosary use separate keys.

Scope: same-tab navigation/reload, not cross-device resume or guaranteed recovery after
a browser crash/tab closure. Snapshot schema validation is minimal; hardening is future work.
Completed-session revisit/replay semantics and browser back/forward deserve further tests.

Rosedal has “Volver a mi rosa” even when no unfinished pot is clickable.
ManualPrayerEntry records 1 / 10 / 50 roses (Ave María / decade / rosary).
It saves neutral legacy fingerprints with source: manual in one batch, then adds the count once.
These are honest manual records, not fabricated measured gestures.
Manual recording updates garden counts; it does NOT move the in-app prayer cursor.
storeRoseData accepts one object OR an array; preserve existing callers.
The garden displays enough pots for recorded progress, even beyond today's target.
Zero daily count must produce [] rather than slice(-0), which shows all historical roses.
Undo/manual arbitrary quantities were not added.

## Patrick and cheap devotion expansion

The current example uses the existing Spanish Breastplate EXCERPT in optionalPrayers.js,
not the complete historical prayer. Ten non-empty newline-delimited verses → ten shield contours.
It retains img and non-empty imgCandidates from that source.
The shield has a Celtic cross, double border, interlace, and jewel details.

URL uses devocion=patrick, NOT oracion=patrick: AppShell consumes/deletes oracion for other flows.
AppShell gives Patrick an isolated key, index 0, and no-op rosary progress callback.
RoseView does not sync Patrick's index into rosaryIndex.
Entry link is in Rosedal. Completing Patrick does not count an Ave María.
The shield is not currently saved in a separate permanent collection.

Next economical architecture (PROPOSAL, not implemented):
1. Extract a small devotion config keyed by id: existing prayer source, language,
   explicit verse splitting, symbol key, completion destination.
2. Generalize the existing Patrick branch; reuse RoseView/VerseDrawing.
3. Supply vector paths in the shared 0 0 100 140 coordinates.
4. Keep reading line breaks independent of contour count. Do not strip mandated images.
5. Test source text preservation, nonempty verses/images, SVG coverage, independent resume,
   and no unintended rose count/index updates.
Do not build a separate gesture engine per devotion. Bespoke artwork is the expensive part.

## Verification: evidence versus remaining checks

Focused runs passed:
- RoseView.test.js — existing sequence/render coverage.
- RoseViewInteraction.test.js — mouse/touch progression, capture/release, plus unmount/remount
  preserves letter/drawing progress and stays paused. Session storage cleared between cases.
- RoseDrawingProgress.test.js — legacy twelve-path compatibility.
- VerseDrawing.test.js — complete contour coverage with differing verse counts,
  finished-stroke stability after serialized trait restore, visible trait differences,
  Patrick images and contour/verse correspondence.
- ManualPrayerEntry.test.js — 1/10/50 count once, batched distinct manual fingerprints.

Relevant ESLint runs passed. Browser loaded Rosa and Patrick without reported runtime errors.
These checks do NOT prove complete phone touch flows, actual cloud round-trip persistence,
or manual-entry navigation end-to-end. No full-repository green claim: unrelated WIP existed.

Cheap regression command (PowerShell):
```powershell
npm test -- --watchAll=false --runInBand --runTestsByPath src/__tests__/RoseView.test.js src/__tests__/RoseViewInteraction.test.js src/__tests__/RoseDrawingProgress.test.js src/__tests__/VerseDrawing.test.js src/__tests__/ManualPrayerEntry.test.js
```
Manual acceptance: drag below text → release completed verse → Rosedal → return at same letter;
hold pill still reads; record a decade → ten new roses; Patrick → return to classic position.

## Environment gotchas and next project

Windows sandbox intermittently failed BEFORE process launch:
“timed out after 15000ms connecting runner pipe-in”.
Approved elevated commands worked; report infrastructure failure accurately.
apply_patch tool also failed in that sandbox. The working fallback invoked the Codex
apply-patch executable via Node spawnSync with a compact patch argument. Do not use shell
write tricks, lose CRLF/user edits, or send whole-file patches beyond Windows argument limits.
PowerShell's default pipeline encoding replaced accented characters with question marks in
new strings; corrected during handoff. Escape non-ASCII as Unicode in the Node script's
JSON string (or explicitly use UTF-8). Verify Spanish labels; tests can reproduce the same
encoding mistake and still pass.

Dev startup: HOST=0.0.0.0, PORT=6660, BROWSER=none, CI=true,
node.exe node_modules/react-scripts/scripts/start.js.
Use established browser verification if changing interactions; keep output compact.

If moving to Matter.js: production path is RosarioVirtualView → RosaryAdapter →
InteractiveRosary. Inspect that path, preserve existing physics, reproduce a concrete defect
before changing it. Archived VirtualRosaryPhysics files are not the current runtime.
The user is considering another project instead; do not begin Matter work without a request.
