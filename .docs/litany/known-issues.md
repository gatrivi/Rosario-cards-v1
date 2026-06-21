# Litany Known Issues

## Fixed (2026)

- **Section metadata drift** — Marian block was `end: 56` (48 verses) but data had 51 Marian verses (9–59). Corrected in `litanyLauretanaSections` to `9–59` / Closing `60–64`.

## Open

### Physics rosary unlock

- `areClosingPrayersUnlocked` not passed in `RosaryAdapter.jsx` → always false
- Heart medal logs "Litany not yet unlocked"; no golden pulse (`isInLitany` also false)
- `heartBeadPressed` listener in RosarioVirtualView works only when InteractiveRosary dispatches unlock path

### Papa prayer index

- `InteractiveRosary.jsx` hardcodes closing `[79, 80, 81]` for LL, S, Papa
- Sequence length is 81 (indices 0–80); **Papa is not in sequence** — index 81 out of bounds
- Tail-bead redirect 9→81 same issue

### Image assets

- `.xcf` and `.jng` paths will 404 — see [assets-and-images.md](./assets-and-images.md)
- Dedicated dolor/gloria/luz mystery packs referenced elsewhere may be missing on disk

### RoseView

- No structured two-voice litany UI — flat teleprompter only

### LitanyDisplay

- `onNextVerse` / `onPrevVerse` props unused

## Deferred

- Per-verse audio (external sound engine)
- Wire unlock props from AppShell progress state
- Add Papa to sequence or remove index 81 references
- RosarioVirtualView `LitanyEntrance` overlay
