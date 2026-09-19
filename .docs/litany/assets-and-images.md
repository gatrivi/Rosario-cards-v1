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

**Owner-curated drop-in folders (v0.3.85):** `public/prayers/<PRAYER_ID>/` scanned
by `scripts/build-prayer-image-manifest.js` (npm prestart/prebuild →
`src/data/prayerImageManifest.json`, read via `src/data/prayerImageFolders.js`).
`NN-name.jpg` pins verse NN (1-based). Folder images skip the text-heavy scrub.

Base-prayer chain (`getPrayerImageCandidates`):

1. User assignment (`rosario_image_assignments`, `prayerId:default`)
2. **Folder images** (`public/prayers/<ID>/`, alphabetical; `[0]` pinned)
3. Mystery maps (MD modooscuro)
4. `imgmo` → `img` → static `imgCandidates`
5. Thematic filename extras
6. `/gallery-images/cathedral-painting.jpg`

`countPrayerPinnedSources(prayer) > 0` → `pickPrayerImage` returns `candidates[0]`
deterministically (no seed rotation over explicit picks).

Per-verse chain (`getLitanyVerseImageCandidates`):

1. Verse assignment (`prayerId:verseIndex`)
2. **Folder verse image** (`NN-*.jpg`), then prayer base assignment
3. `verse.imgmo` → `verse.img` → prayer fallback `imgmo` / `img`
4. Folder base images
5. `/gallery-images/cathedral-painting.jpg`

BookletView, RosarioVirtualView, OptionalPrayerSheet and roseViewHelpers all use
these resolvers (`resolveLitanyVerseImage` / `resolvePrayerVerseImage` already pin
`candidates[0]`).

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
