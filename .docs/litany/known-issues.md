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

## Deferred

- Per-verse audio (external sound engine)
- Wire `pickRecordingForSlot` into Libro/Rosario advance (auto voice playback)
- Dedicated station images for Vía Crucis / Vía Lucis
- Per-station meditation texts (titles exist; refrain is shared placeholder)
