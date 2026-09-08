# Matter rosary handoff — 2026-09-06

Local changes only. No commit, push, deployment, or version bump. Badge remains v0.3.82.
Unrelated existing work in AppShell, Libro, Rosa, garden, audio and data remains untouched.

## Start here

User verdict after physics/framing: **“pretty much usable.”** Latest requested work, artwork transitions, is implemented and browser-checked. The user then requested this handoff; do not infer approval to deploy or undertake a broad redesign.

**Next issue:** chains are hard to see/select, and the user accidentally selected one while aiming at a lone bead. Ideas offered, not implemented: visible beads should win nearby taps; chain hit areas should follow the visible link and stay clear of bead centers; improve chain contrast. Verify the exact lone-bead/chain overlap before editing. Keep pan gating and Matter picking consistent if selection geometry changes. Do not bring back the blanket 28px exclusion halo.

**Preserve:** release-only prayer commits; drag/hold/pinch cancellation; single-owner progression/counting; current cross parent constraint; zoom-correct picking; screen-coordinate swipe distances; artwork/text transition state independent of physics. Keep prayer image candidates populated.

Production path: `RosarioVirtualView` → `RosaryAdapter` → `InteractiveRosary`. `VirtualRosaryPhysics.jsx` is a re-export; the stable archive is not the active implementation.

## Files changed in this work

| Area | Files under `src/` |
| --- | --- |
| Physics and gestures | `components/RosarioNube/InteractiveRosary.jsx`, `RosaryAdapter.jsx` |
| State and coordinates | `components/RosarioNube/hooks/useBeadInteraction.js`, `hooks/useRosaryState.js`, `utils/canvasPointer.js` |
| New helpers | `components/RosarioNube/utils/beadProgression.js`, `utils/rosaryLayout.js` |
| View and presentation | `components/Views/RosarioVirtualView.jsx`, `RosarioVirtualView.css`, new `RosaryPrayerTransition.jsx` |
| Artwork | `components/common/VitralBackground.jsx`, `VitralBackground.css`, new `ArtworkCrossfade.jsx` |
| Tests | New `__tests__/InteractiveRosaryGestures.test.js`, `RosarioVirtualProgression.test.js`, `RosaryArtworkTransition.test.js`; expanded `canvasPointer.test.js` |

The working tree contains substantial unrelated changes and untracked files. Do not stage/reset the whole tree. This handoff and the documentation index were updated; `agents.md` edits predate this work.

## Resume and verification

Preview URL: http://127.0.0.1:6672/rosario. Server may still run; verify before starting a duplicate. Temporary verification browsers were closed.

PowerShell start command (Node's temp-directory access required sandbox escalation here):

```powershell
$env:HOST='127.0.0.1'
$env:PORT='6672'
$env:BROWSER='none'
node.exe node_modules/react-scripts/scripts/start.js
```

Use `npm.cmd`, because PowerShell blocks `npm.ps1` under its execution policy.

```powershell
npm.cmd test -- --watchAll=false --runInBand --runTestsByPath src/__tests__/InteractiveRosaryGestures.test.js src/__tests__/RosarioVirtualProgression.test.js src/__tests__/VirtualRosaryPhysics.test.js src/__tests__/canvasPointer.test.js src/__tests__/rosarySequenceUtils.test.js src/__tests__/rosaryMysteryChain.test.js src/__tests__/RosaryArtworkTransition.test.js src/__tests__/BookletView.test.js
```

Tests were run in focused batches, not as the combined command above: **22 passed** after physics/framing; **23 passed** after transitions across artwork, view progression and Libro (overlapping suites; do not add these counts). No full repository test run or production build/deployment was performed. CRA development compilation succeeded.

Browser: use the agent-browser skill. Headless Chrome needed escalation because sandboxed runs closed the CDP connection. PowerShell strips JavaScript quotes in native CLI arguments: use `eval --stdin`. Dismiss the first-run guide before screenshots; some intermediate captures included it. Browser default reported reduced motion enabled; `set media light` disabled it for the normal-motion timing check. Verification used DOM mouse events through real Matter handlers, plus solver tests; physical phone touch feel has not been independently tested.

## Changes

- `InteractiveRosary`: commit selection, repeat actions, medal navigation and prayer history on clean release. Drag, pinch and cancellation cannot navigate. Live refs keep unlock and feedback state current without recreating the physics world.
- `RosarioVirtualView`: sole owner of repeat progression, including Gloria/Fatima and inner verses. Empty taps do not advance; every hold starts from zero and completes at most one step.
- `canvasPointer`: Matter mouse scale follows CSS zoom. Gesture distances use screen coordinates so panning does not swallow swipes. Pan gating matches actual Matter geometry, including invisible chain targets, without a surrounding 28px exclusion region.
- `useBeadInteraction`: feedback stores actual body IDs; timers clean up on unmount. Next-bead lookup uses sequence index rather than repeated prayer IDs.
- Closing-prayer glow uses the same dynamic tail mapping as navigation.

## Correction to the September 5 audit

The cross-part diagnosis was incorrect: Matter 0.20's MouseConstraint selects the composite parent. A regression test verifies actual MouseConstraint picking. The browser revealed a different cause of missed picking: CSS zoom was not applied to Matter's mouse coordinates.

## Verification

18 tests pass across InteractiveRosaryGestures, RosarioVirtualProgression, VirtualRosaryPhysics, canvasPointer, rosarySequenceUtils and rosaryMysteryChain.
Includes cross picking, release-only commits, repeated Gloria/Fatima steps, one Ave Maria count, drag/cancel/pinch rejection, changing medal unlock, CSS zoom, panning/swipe coordinates, empty taps after completed prayers and one completion per hold.

CRA dev server compiles successfully. Chrome checks at desktop and 390×844 exercised DOM mouse events through the actual canvas/Matter/view path: cross → Ave Maria → Gloria → Fatima → mystery; drag leaves prayer unchanged; empty tap leaves prayer unchanged; horizontal swipe advances. No error overlay or reported page errors. These are automated browser checks, not physical-phone touch testing.

Preview started at http://127.0.0.1:6672/rosario; process is a session resource and may need restarting.
This was the interaction-only baseline; the physical-feel/framing follow-up below supersedes it.

## Follow-up: physical feel and framing

User authorized this pass after the interaction repair.

- Replaced the viewport-dependent circle with an evenly spaced oval. Physical bead sizes adapt to short/narrow viewports; default magnification is 1x. Explicit saved zoom remains respected.
- Restitution is now 0.12 independent of prayer history; air friction defaults to 0.07. Chain stiffness 0.18, damping 0.18, four constraint iterations; mouse stiffness 0.2 with damping 0.18 in both modes.
- Fixed the cross's chain constraint to act on the compound parent, with an offset at the head. Previously the solver acted on a child part instead of the cross body.
- Added “Acomodar rosario”: restores zoom, pan and initial bead arrangement without changing the prayer. Rosary controls now clear the actual bottom navigation. Removed the unsupported draw-a-cross hint.
- Viewport resize rebuilds geometry and recenters pan after 150ms; zoom/pan gestures and prayer changes still do not recreate physics. Zero-size initialization waits for a measurable viewport.
- Rosary prayer panel starts overflowing content at the top, avoiding clipped opening text on short screens.

Verification expanded to 22 tests across the same six suites. Real Matter simulations at 320×568, 390×744 and 844×330 settle, pull/release the cross and settle again: finite body positions, bounds inside the viewport, speeds below 0.3. Reset does not navigate.
Chrome checked 390×844, 320×568 and 844×390: fitted rosary, resize updates canvas dimensions, reset retains prayer, reset button receives pointer hits, no horizontal overflow or error overlay. Feel remains subject to hands-on review on a physical phone.

## Follow-up: artwork transitions

User says the rosary is usable; chain visibility and accidental selection near lone beads remain feedback for a future interaction pass. Suggested giving visible beads priority for near taps and restricting widened chain targets to the visible links. No chain-picking changes in this pass.

- Rosario no longer remounts its background on every step. A rosary-specific crossfade retains the previous image while the next loads/decodes, dissolves over 1400ms, and coalesces rapid changes after the active dissolve finishes.
- Text fades out for 220ms, waits for artwork, leaves it unobstructed for 500ms, then fades back over 550ms. This is presentation only; counting and Matter progression remain immediate. Reversing direction quickly cancels obsolete text transitions.
- Failed/stalled image requests retain the previous art and release the text wait. Removed the step flash. Reduced-motion CSS uses near-instant opacity changes.
- Existing Libro crossfade implementation remains selected for Libro.

23 tests pass across RosaryArtworkTransition, RosarioVirtualProgression and BookletView. Chrome confirmed leaving/hidden/ready phases, retained loaded images and unchanged canvas identity. Normal-motion check measured an intermediate overlay opacity of 0.116811 with a 1.4s transition; reduced-motion mode was checked too. No page errors/overlay. Still local, not deployed.
