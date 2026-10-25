# Handoff 2026-09-26 — La Vidriera (v0.3.87): the images finally show up

Local only, not deployed. 60 suites / 391 tests green, build compiles clean.
Preceded by `handoff-2026-09-26-el-estante.md` (v0.3.86).

## The complaint

> "i always see the same 2 or 3 every time hail mary comes up. realistically this
> requires me to sit and pick the images one by one, but i cant do that now"

It did not require picking anything. Three separate faults, none of them a
judgement problem:

1. **The Ave María had 3 usable candidates and one that 404'd.** `A` carries no
   `imgCandidates`; the chain synthesised `ave-maria.jpg`, `MetMary…`,
   `roseLimaJuarez…`, then `FALLBACK = /gallery-images/cathedral-painting.jpg`
   — **a file that has never existed**. Rotation was `candidates[safeIndex % 4]`,
   so 53 Ave Marías cycled four pictures with a blank every fourth.
2. **258 images sat in `src/data/assets/img/Arte-Sacro/ave/`, referenced by
   nothing.** 252 have meaningful names.
3. **28 of 102 Letanía image paths 404'd** — not lost, misnamed (see below).

## What the git forensics actually said

The Letanía verse→image map is **intact and correct** — it is the owner's
hand-made work in `src/data/litanyLauretana.js`, 60 verses, each with its own
art. The *binaries* are intact too. They simply never matched:

- **`44b014a` "another rosary approach"** (2026-06-20) committed the verse map
  **and** the verse art in the same commit, under **two different naming
  conventions** — the code says `mater-amabilis.jpg`, the file landed as
  `Mater amabilis.jpg`. Same for `Virgo potens` → `Virgen poderosa.jpg`.
  `git log --diff-filter=D` shows **nothing was ever deleted**.
- **`d7317ca` "some work"** (2026-07-14) reorganised `public/gallery-images`
  into `litografia/` `modoclaro/` `gloria/` `img-texto-rezos/` and did not
  update the data pointing into it — 26 stale paths.

No commit implicates an agent: both are authored under the owner's own git
identities. `Cursor Agent <cursoragent@cursor.com>` is a distinct, later set of
40 commits (Jun–Aug 2026) that never touched these paths. A name is not
recoverable, so none is invented here.

## Repairs

### Phases 1–2 — the 404s (`scripts/restore-litany-art.js`, `repair-litany-paths.js`, `repair-rosary-paths.js`)

Idempotent one-off scripts, kept so the reasoning is auditable.

- 11 files copied out of `Arte-Sacro/ave/` into `public/gallery-images/litany/modooscuro/`
  (copied, never moved — agents.md).
- 17 path repointed, each an **explicit reviewed decision**, never a fuzzy match:
  separator drift, Latin→Spanish title (`Virgo potens` → `Virgen poderosa`),
  or a dead light-mode slot whose dark image exists.
- 26 rosary paths repointed to their real subfolders.
- Result: **102/102 → 100/100 litany paths resolve** (two were consolidated).

Two verses looked unrecoverable and were **not**:

| Verse | broken | verdict |
|---|---|---|
| Cristo, escúchanos | `litany/01-1-0.JPG` | the *dark* image `cristo-escuchanos.jpg` exists and is what the app renders — only the unused light slot was missing |
| Santísima Trinidad, un solo Dios | `litany/01-2-0.JPG` | same: `santisima-trinidad.jpg` exists |

**The owner was asked for nothing.**

One semantic fix worth knowing: *Reina de todos los Santos* pointed at an Alacoque
Sacred Heart consecration plate. Repointed to `reina-de-todos.jpg`.

And a defect found while repairing: **`Salud de los enfermos.jpg` and
`Refugio de los pecadores.jpg` are byte-identical** in the download dump, so
copying both gave two verses one picture. `Salud de los enfermos` now uses
`lourdes.jpg` (the healing shrine). Flagged for the owner.

### Phase 3 — the guard (`imagePathsOnDisk.test.js`)

Four tests: the global fallback resolves, no data/utils/component file names a
missing served image, every non-text-heavy registry image resolves, and every
declared path is written in **NFC**.

The NFC test exists because `galleryMargaritaSacredHeart` shipped with a
**decomposed** path (NFD) while the file on disk is precomposed (NFC) — same
length, same visible text, different bytes. It works on Windows and macOS and
**404s on the deploy**, because those filesystems normalise and the server does
not. That class was invisible until the paths were compared byte-wise.

`FALLBACK` is now `galleryCathedralPraying` and exported as `FALLBACK_IMAGE`.

### Phase 4 — occurrence-aware rotation (`prayerImages.js`)

A rosary builds all 53 Ave Marías from **one shared prayer object**, and rotation
was seeded with the raw sequence position, so every repetition landed on the
same phase of the pool.

- `occurrenceIndexAt(sequence, index)` — how many times this id has already
  appeared. New `pickPrayerImage(candidates, occurrence, pinnedCount)`.
- **Pin semantics changed** (owner-approved): a file in `public/prayers/A/` pins
  **occurrence 0 only**; later occurrences rotate the rest of the pool. Previously
  any pin froze all 53 on `candidates[0]`, which would have made the folder
  mechanism fight variety. Rotation starts *after* the pinned head so a pin never
  repeats immediately.
- The seed was the **target** step while `activePrayer` was `secuencia[displayIndex]`
  — mid-crossfade the image belonged to a different step than the one painted.
  Both views now seed on the displayed step's occurrence.
- The two hardcoded `seed = 0` calls in the litany/per-verse branches are gone.

Still fully deterministic: step N resolves identically every session.

`PrayerFolderImages.test.js` encoded the old "pin beats any seed" rule and was
**rewritten to the new contract** rather than worked around.

### Phase 5 — the Mary pool

`Arte-Sacro/ave/` → `public/gallery-images/ave/`, referenced by a generated
manifest, **not** 240 webpack imports (the JS bundle would have absorbed 35 MB).

- `scripts/build-mary-image-pool.js` → `src/data/maryImagePool.json`, wired into
  `prestart`/`prebuild` beside the existing prayer-manifest script.
- 258 files → **240 served**: 7 junk names, 9 byte-identical, 2 same-name.
  Dedupe is by **content hash and exact name only** — an earlier stem-with-digits
  rule was reverted because it was discarding three *different* photographs of
  Our Lady of Sorrows, which is the opposite of the point.
- Classified into 10 themes by filename. **Every entry carries a `confidence`**:
  17 `high` (the filename names the subject — `Annunciation.jpg`,
  `Refugio de los pecadores.jpg`, `blessed mother theotokos…`) and 223 `low`
  (guessed). Nothing here assigns art to a verse; that stays the owner's call.
- Added as the **last** tier of `getPrayerImageCandidates`, and deliberately
  **not** counted by `countPrayerPinnedSources` — otherwise a non-empty pool
  would pin `candidates[0]` and kill the rotation it exists to feed.
- `MARY_PRAYER_IDS` currently holds only `A`. Widening it is one line.

**Measured result:** candidate pool 4 → **214**; the 53 Ave Marías now resolve to
**53 distinct images**, up from 3–4.

### Phase 6 — per-verse images on by default (Libro only)

`prayerVerseCatalog.js` already carried 9 hand-picked `defaultImageId`s for `A`
and all 9 resolve. `perVersePrayerImages` defaulted to `false`, so none of it was
ever shown. Now on for the **Libro**, and deliberately still off for the
**rosary** via a separate `perVerseImagesInRosary` setting.

That split is load-bearing, not cosmetic: in `RosarioVirtualView` the same flag
also drives *navigation* — `handleAdvance` returns early to bump
`prayerVerseIndex` instead of moving to the next step, so leaving it on would
have made one Ave bead cost **nine taps**. The Libro already advances verse by
verse, so nothing changes there but the picture.

Checked and cleared: **no rose inflation.** `onAveMariaComplete` only fires in the
`currentPrayerIndex + 1` branch, i.e. once the verses are exhausted, so a
per-verse Ave still logs exactly one rose.

### Phase 7 — one-pass review (`/assets` → *Revisar devociones*)

New **"Biblioteca María"** tab: browse the pool, search it, filter to
unreviewed / low-confidence / rejected, bulk-accept the high-confidence ones, and
**"Descartar"** an image to remove it from every chain on every device.

- `src/utils/rejectedImages.js` — a "this picture is wrong" list. Distinct from
  `imageAssignments` (which pins art *to* a prayer); this removes art *from* the
  pool. Same localStorage + `artConfigSync` conventions, and it now rides the
  cloud slice and the JSON export (`artConfigPortable` bumped to v2).
- `artConfigSync.applyArtConfigFromCloud` treated a payload with only rejects as
  `empty` and dropped it; fixed.
- The sorted pool is memoised on the rejection list, because
  `getPrayerImageCandidates` runs on every step change.

## Not done

- **`MARY_PRAYER_IDS` is only `A`.** `P`, `G`, the Marian litany and most short
  prayers would all benefit; deliberately conservative, one line to widen.
- **The 223 `low`-confidence themes are unreviewed.** That is the owner's pass,
  now cheap. Only `high` entries were trusted enough to order the pool.
- **No verse-level assignment was authored.** The owner wired the litany by hand
  and that work was recovered as-is.
- **`public/` grew ~35 MB** (240 files). Nothing in the JS bundle beyond the
  ~11 kB gzip manifest (+263 kB → +274 kB main chunk).
- San José (no art) and the 13 unbaked guide clips are unchanged.
- The `imglight` field remains dead code — its paths were repointed, but nothing
  reads it. The light/dark revamp is still a separate decision.

## Follow-up — which ids get a pool, and the fallback bug (still v0.3.87)

60 suites / 391 tests. Adds a Passion pool and one free bug fix.

### The whitelist is correct as-is

Measured across all 19 Libro sequences (224 distinct ids + 10 optional):

| id | occurrences | Marian? | repeats inside one sequence? |
|---|---|---|---|
| `A` | 357 | yes | **yes — 53×/rosary** |
| `S` | 4 | yes | no — 1× |
| `LL` | 4 | yes | no — 1× |
| `MG1–MG4` | 2 each | yes | no — 1× |
| `MP` | **101** | **no** | yes |
| `P` / `G` / `F` | 41 / 38 / 38 | no | yes |

`occurrenceIndexAt` is only > 0 for a prayer that repeats *within* one sequence.
`S`, `LL` and `MG1–MG4` therefore always resolve occurrence 0, so **rotation
provably cannot engage for them** — a pool would change which single image they
show, not add variety. `A` is the only Marian id that needed whitelisting.

And the repetition that hurts is Christological. `MP` is *"Por su dolorosa
Pasión, ten misericordia de nosotros"* — a prayer to **Christ's** Passion, so Mary
art behind it is the same error as the Alacoque plate.

### Free bug: the fallback was in the rotation span

`FALLBACK_IMAGE` is pushed last in every chain and `pickPrayerImage` rotated over
the whole array, so it consumed a slot. `P`'s chain is exactly
`padre-nuestro.jpg` + the fallback — so **half of all 41 Padre Nuestos showed the
generic cathedral**. It is the `onError` target in `VitralBackground`, a safety
net, not a candidate. Now excluded from the span.

**Honest effect, measured:** `P` 2→1 distinct, `C` 2→1, `G` 3→2, `F` 4→3, `A`
unchanged at 53. The distinct counts went *down* by exactly the number of fallback
slots, and every one of those slots was the same generic cathedral. That was fake
variety; all 6 Padre Nuestos now show actual Padre Nuestro art.

Two `PrayerFolderImages` assertions encoded the old span and were rewritten to
compute the rotatable count from the chain rather than hardcode it.

### Passion pool — `scripts/build-image-pools.js`

`scripts/build-mary-image-pool.js` became `build-image-pools.js` holding **both**
pool definitions, so the classifier/copier/pruner is not written twice. Sources:
`Arte-Sacro/medieval-renaissance/` + `classic-orthodox/` → `public/gallery-images/passion/`
(47 images). `DarkMode/` is **not** re-copied — it duplicates
`public/gallery-images/misterios/modooscuro/` and its Passion plates are already in
the registry.

Ids enabled: `MP`, `DMO1`, `DMO2`, `MD1`–`MD5`. Deliberately **not** `LPB_*` /
`PB_*` / `PBO_*` / `VC_*` despite their large collision counts — those already carry
per-verse art.

**Wrong-subject files are excluded, not down-ranked.** A first attempt had the deny
list inverted (it excluded `our lady` / `virgen` / `madonna` from the *Mary* pool)
and dropped high-confidence 17 → 6; fixed, and `WRONG_SUBJECT` now only exists for
the Passion pool. `passionImagePool.test.js` asserts no Mary image is served behind
a Passion prayer, so that class cannot return.

The generator also **prunes orphans** — earlier runs with different rules had left
9 files in `ave/` and 13 Mary images in `passion/`. Disk and manifests now match
exactly (240 / 47).

**Measured result:** `MP` across a Corona de la Divina Misericordia went from
**5 distinct images over 50 occurrences to 41**.

### `AGENTS.md` id correction

Lines 145–147 had `AC` and `C` swapped relative to the code (`C` is the Credo,
`AC` the Acto de Contrición). Fixed, with a note that the code is the truth.

## Corrected — the metadata now lives in the image database

60 suites / 399 tests. The two generated `*ImagePool.json` manifests were the
wrong architecture and have been removed.

### What was wrong

The repo already had an image database and a selection primitive:

- **Firestore `shared/imageLibrary`** (`firebaseImageLibrary.js`), mirrored in
  `localStorage['rosario_image_library']` (`imageLibraryStore.js`) and merged into
  `listImages()` as the third layer of `withOverrides()`.
- `LITURGICAL_CATEGORIES` — 12 fixed tags, applied from the Asset Studio
  "Clasificar" tab.
- `imagesByTag()` and **`pickByTag(tag, seedIndex)` — which had zero call sites.**

Instead I invented a parallel taxonomy (`annunciation`, `mother-and-child`,
`getsemani`, `crown-of-thorns`…) and two generated manifests, and a parallel
`MARY_PRAYER_IDS` selector. The images were always in the right place; only the
metadata was wrong.

### What it is now

```
REGISTRY (~70, compile-time)  →  imageLibraryCatalog (287, shipped)
                              →  overrides (localStorage ⟷ Firestore shared/artConfig)
                              →  library  (localStorage ⟷ Firestore shared/imageLibrary)
```

`scripts/build-image-pools.js` emits **one** `src/data/imageLibraryCatalog.json`,
merged by `imageRegistry` as the **floor**. It is not a second database: the real
image database is `shared/imageLibrary`, and the catalog only ships the static
part of it so a first-run or offline device is never blank. The owner's edits
sit on top, so a rename or re-tag is never clobbered by a catalog rebuild, and
tagging a catalog entry never bloats the Firestore library doc
(`ClassifyImagesPanel` only pushes `source === 'upload'`).

**Tags are one taxonomy, not two.** Every entry carries ≥1 of the 12 liturgical
categories, so "Clasificar" and `hasLiturgicalCategory` work unchanged; the finer
`theme` rides along as an *extra* tag for ordering precision. `confidence` is
dropped for Mary (owner approved the folder), kept for Passion.

`prayerImages.js` now selects through `imagePathsByTags(tags, { excludeIds })` —
built on the merged registry, reject-aware, and the intended home for
`pickByTag`'s job.

**Deleted:** `maryImagePool.json`, `passionImagePool.json`, `maryImagePool.js`,
`passionImagePool.js`, `imagePoolReader.js`, `maryImagePool.test.js`,
`passionImagePool.test.js`.

**The tag list must be most-specific-first.** Every Mary image carries the coarse
`mary` category, so listing it first makes the rest of the list inert. With
`['annunciation', …, 'mary']` the Ave María orders correctly; the first attempt
had `mary` first and the Annunciations sank into the catch-all.

### Memoization was a prerequisite, not polish

`isTextHeavyImagePath` → `listImages()` → `withOverrides()`, which did **two
`JSON.parse(localStorage)` calls and a full object rebuild — on every call**.
`isTextHeavyImagePath` runs once per candidate push, and the Ave María chain is
~260 candidates, so every step change paid that ~520 times. Adding 287 entries
would have made it ~4× worse.

`withOverrides()` is now cached and invalidated by `ART_CONFIG_CHANGED_EVENT` and
`IMAGE_LIBRARY_CHANGED_EVENT`; `isTextHeavyImagePath` uses a `Set` of text-heavy
paths instead of a `.some()` scan. `imageRegistryCache.test.js` pins both halves.

### Measured, after

| | before | after |
|---|---|---|
| Ave María, 53 repetitions | 3–4 distinct | **53 distinct** |
| `MP`, 50 repetitions in a Corona | 5 distinct | **49 distinct** |
| Registry entries | ~70 | **~357** |
| Chain build per step change | ~520 localStorage parses | 0 after first |

Ave María precedence: 18 hand-picked curated images first (`ave-maria.jpg`, the
thematic extras, the per-verse `defaultImageId` plates), then the catalog — 35 of
the 53 repetitions come from `public/gallery-images/ave/`.

### `AGENTS.md` id correction

Lines 145–147 had `AC` and `C` swapped relative to the code (`C` is the Credo,
`AC` the Acto de Contricción). Fixed, with a note that the code is the truth.

## Verification

`npm test` (60 suites / 399 tests) · `npm run build` (compiled, no warnings).

`imageLibraryCatalog.test.js` covers what can silently rot: every path resolves,
is NFC and round-trips its URL; every entry has a liturgical category; no Mary
subject is tagged `passion`; an owner re-tag wins over the shipped one.
`repeatedPrayerImageVariety.test.js` pins the two numbers above, so the migration
cannot quietly undo them.

`imagePathsOnDisk.test.js` now also covers **both pool manifests** — every entry
must exist on disk, round-trip through `encodeURI`, and be NFC. That test is what
caught the NFD bug, so the pools were inside its scope from the first commit rather
than after a production 404.

Two guard tests are the ones that matter if this ever regresses:
`imagePathsOnDisk` (nothing declared is missing, nothing is mis-normalised) and
`repeatedPrayerImageVariety` (53 Ave Marías, 53 distinct images, still
deterministic).
