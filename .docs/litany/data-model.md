# Litany Data Model

## Source files

| File | Role |
|------|------|
| `src/data/litanyLauretana.js` | Meta, sections, 65 structured verses |
| `src/data/RosarioPrayerBook.js` | Merges litany into `cierre[]`; `LL` at index 79 in `RGo`/`RDo`/`RGl`/`RL` |
| `src/utils/litanyHelpers.js` | Lookup, `formatLitanyLine`, `isLitanyPrayer` |
| `scripts/extract-litany.js` | Regenerates `litanyLauretana.js` from legacy master data |

## Meta (`litanyLauretanaMeta`)

```js
{
  id: 'LL',
  title: 'Letanía Lauretana',
  img, imgmo,           // prayer-level fallback backgrounds
  text                  // legacy flat string (newline-separated pairs + closing)
}
```

## Sections (`litanyLauretanaSections`)

| Section | Indices | Count | Response pattern |
|---------|---------|-------|------------------|
| Invocations | 0–8 | 9 | Kyrie / Christe / Trinitarian — mixed |
| Marian Titles | 9–59 | 51 | Fixed: **Ruega por nosotros** |
| Closing | 60–64 | 5 | Agnus Dei triplet + collect |

## Verse object schema

```js
{
  invocation: string,
  invocationLatin?: string,
  response: string,
  responseLatin?: string,
  section: 1 | 2 | 3,
  img?: string,
  imgmo?: string
}
```

## Two-level indexing

```
currentPrayerIndex === 79  (rosary step)
  └── litanyVerseIndex 0..64  (nested)
        └── litanyLauretanaVerses[i]
```

| View | Outer index | Inner index |
|------|-------------|-------------|
| BookletView | `displayIndex` | `litanyVerseIndex` |
| RosarioVirtualView | `currentPrayerIndex` | `versoIndex` |
| Helpers | — | `getLitanyVerse(index)` clamps 0..64 |

## Closing verses (audio-relevant)

| Index | Invocation | Response |
|-------|------------|----------|
| 60 | Cordero de Dios… | Perdónanos, Señor |
| 61 | Cordero de Dios… | Escúchanos, Señor |
| 62 | Cordero de Dios… | Ten piedad de nosotros |
| 63 | Ruega por nosotros, Santa Madre de Dios | Para que seamos dignos… |
| 64 | Oremos | Closing collect (long) |

## `formatLitanyLine(verse)`

Used by RoseView teleprompter and flat displays:

- If `invocation !== response`: `"invocation: response"`
- Else: invocation only

## Sequence enrichment (`RoseView.getSequenceData`)

When `id === 'LL'` and `verses` exist:

- `litanyVerses` — raw verse objects
- `litanySections` — section metadata
- `verseImages[]` — resolved per verse via `resolveLitanyVerseImage`
- `versos[]` — formatted lines for teleprompter

## Not a physical bead

`LL` is **not** mapped in `physicsRosaryData.js` (61-node rosary). Reached via sequence index 79 or heart-medal UI when unlocked.
