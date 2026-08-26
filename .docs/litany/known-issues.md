# Litany Known Issues

> **Agents:** verify in source before fixing. This file has been wrong before.

## Fixed (2026)

- **Section metadata drift** — Marian block was `end: 56` (48 verses) but data had 51 Marian verses (9–59). Corrected in `litanyLauretanaSections` to `9–59` / Closing `60–64`.
- **`areClosingPrayersUnlocked` not passed** — Fixed: `RosaryAdapter.jsx` passes it via `useMemo` + `isClosingPrayersUnlocked()` from `rosarySequenceUtils.js`.
- **Hardcoded closing indices `[79,80,81]` / Papa OOB** — Fixed: `InteractiveRosary.jsx` builds `tailToClosingMap` dynamically from `physicsMaps.closingPrayers` (LL + S only; Papa not in sequence).

## Open (minor / low priority)

### LitanyDisplay

- `onNextVerse` / `onPrevVerse` props destructured but unused (navigation handled elsewhere)

### Image assets

- Some legacy `.xcf` / `.jng` paths may 404 — see [assets-and-images.md](./assets-and-images.md)
- Dedicated per-station Vía Crucis/Lucis art still provisional (misterios dolorosos/luminosos rotation)

### RoseView

- No structured two-voice litany UI — flat teleprompter only


## Fixed (2026-08-26)

- **Rosa unprayable on phones** — `BottomNav` (absolute, z=50, transparent `glass-footer` on Rosa) covered the hold-to-pray pill; every press hit the invisible nav. Zone + hints now sit above `var(--app-above-nav)`. Also: touch release double-fired the advance (`pointerup` + implicit leave), consuming the "Amén." state — guarded via `isPointerDownRef`. Helpers extracted to `roseViewHelpers.js`. Commit `243274b`, v0.3.82.

## Fixed (2026-07-03 night)

- **Per-station Vía Crucis / Lucis meditations** — unique text per station in `viaCrucisData.js`
- **Voice auto-play** — `usePrayerVoiceAutoplay` + `pickRecordingForSlot` in Libro and Rosario virtual

## Deferred

- Per-verse audio (external sound engine)
- Dedicated station images for Vía Crucis / Vía Lucis
- Confirm before deleting a voice take
