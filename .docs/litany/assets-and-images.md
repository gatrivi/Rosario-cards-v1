# Litany Assets and Images

## Folder layout

```
public/gallery-images/litany/
  *.JPG                    — legacy light paths
  modooscuro/              — preferred dark vitrals (~168 files)
```

No dedicated `public/assets/` — all paths are root-relative URLs.

## Resolution policy

`src/utils/prayerImages.js` — `PREFER_MODOOSCURO = true`

Per-verse chain (`getLitanyVerseImageCandidates`):

1. `verse.imgmo`
2. `verse.img`
3. Prayer fallback `imgmo` / `img` (from meta)
4. `/gallery-images/cathedral-painting.jpg`

BookletView and RosarioVirtualView both use this resolver.

## Prayer-level fallbacks (meta)

- `img`: `/gallery-images/litany/01.JPG`
- `imgmo`: `/gallery-images/misterios/modooscuro/francisco_de_asis_2.jpg`

## Known broken paths

| Issue | Examples |
|-------|----------|
| GIMP `.xcf` in browser | `01-1-0.xcf`, `01-2-0.xcf` (indices 4, 8) |
| `.jng` typo | `reina-rosario.jng`, `Reina concebida sin pecado original.jng` |
| imgmo-only closing verses | Agnus Dei block (60–62) — no light `img` |
| Long filename vitral | verse 64 `Oremos` background |

VitralImage / candidate chain falls through to next candidate on `onError`.

## Regeneration

```bash
node scripts/extract-litany.js
```

Reads legacy master structure; overwrites `src/data/litanyLauretana.js`. Run only when intentionally syncing from source.

## Sound engine note

Image paths are irrelevant to audio-only engine. Export verse text + index + section from `litanyLauretanaVerses` directly.
