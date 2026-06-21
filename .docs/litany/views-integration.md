# Litany Views Integration

## BookletView (primary — complete)

**Path:** `AppShell` → `vistaActiva === 'booklet'` → `BookletView.jsx`

- `buildSequence()` → prayer with `verses`, `sections` from `cierre`
- `isLitanyPrayer(activePrayer)` when `id === 'LL'`
- Sub-index: `litanyVerseIndex` (0..64), reset on entering LL
- Navigation: `goNext` / `goPrev` advance verses before booklet step
- Background: `resolveLitanyVerseImage(verse, prayer, index)` per verse
- UI: `LitanyProgressBars` + `LitanyDisplay` + one-time `LitanyEntrance`

Key refs: lines ~218–237, 357–465, 510–522, 651–700.

## RosarioVirtualView (partial)

**Path:** `vistaActiva === 'rosary'` → `RosarioVirtualView.jsx`

- Uses `getSequenceData()` enriched LL branch from `RoseView.jsx`
- Background: `verseImages[versoIndex]`
- UI: `LitanyProgressBars` + `LitanyDisplay`
- Verse advance: `beadRepeatTouch` when on LL step
- Heart shortcut: `heartBeadPressed` → jump to LL index (requires unlock — see known-issues)
- No `LitanyEntrance` overlay

## RoseView (Jardín)

- LL gets flat `versos[]` and `verseImages[]`
- No dedicated `LitanyDisplay` — generic word teleprompter
- `PRAYER_FREQ['LL'] = 130.81` (C3 drone)

## InteractiveRosary / RosaryAdapter

- `LL` excluded from chain-prayer lookahead (`AC`, `C`, `G`, `F` only)
- Heart medal handler in `InteractiveRosary.jsx` (~1030–1049)
- **`RosaryAdapter` does not pass:**
  - `isInLitany` (default false)
  - `areClosingPrayersUnlocked` (default false)
- Closing tail redirect maps indices 5→79, 6→80, 9→81 when unlocked — Papa at 81 invalid

## Components (`src/components/Litany/`)

| Component | Role |
|-----------|------|
| `LitanyDisplay.jsx` | Two-voice colored invocation/response |
| `LitanyProgressBars.jsx` | Single bar for current section |
| `LitanyEntrance.jsx` | 3s boss-style overlay (Booklet only) |

`LitanyDisplay` accepts `onNextVerse` / `onPrevVerse` but does not call them — parent drives navigation.
