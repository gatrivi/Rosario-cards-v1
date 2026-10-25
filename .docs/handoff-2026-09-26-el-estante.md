# Handoff 2026-09-26 — El Estante (v0.3.86): the devotions shelf becomes real

Local only, not deployed. Baseline before this session: 315 tests, and
`AppShell.jsx` did not parse. After: 359 tests, clean build.

## Problem

`src/data/historicDevotionsCatalog.js` listed 16 devotions and was referenced by
**nothing but its own test**. It could not be consumed because its `status` field
was dishonest: `status: 'have'` meant "exists somewhere in the app", not "is a
shelf devotion".

- `eucharist` / `loreto` → `'have'`, but they duplicate surfaces that already
  exist (Sagrado Corazón adoration; the rosary closings).
- `st_michael` / `st_expeditus` → `'have'`, but they are *optional brief prayers*,
  not recorridos.
- The 6 `status: 'soon'` devotions had **zero prayer text** anywhere in `src/data`.

Meanwhile `DevotionsShelf` had a "Próximas" section (`DevotionsShelf.jsx:202`)
and Libro passed `proximas={null}` — the section existed with no producer.

## What changed

### Catalog is now the source of truth

`status: 'have' | 'soon'` → `surface: 'vias' | 'recorrido' | 'breve' | 'embedded' | 'soon'`
plus `targetId` (the real sequence id / optional prayer id, `null` for `soon`).
`historicDevotionsCatalog.test.js` now resolves every `targetId` against the real
registries, so a rename or a dropped devotion fails CI instead of rotting.

A `soon` entry may carry `blockedBy` explaining what unblocks it; a test asserts
every `soon` entry has one and no shipped devotion does.

### Five devotions shipped

| id | Shelf | Shape | Source of the text |
|---|---|---|---|
| `memorare` | Recorridos | 1 step, ES/EN/LA | Traditional, San Bernardo |
| `medalla_milagrosa` | Recorridos | 3 steps | The medal's own engraving: the motto, Rev 12:1's twelve stars, the two hearts (Luke 2:35) |
| `inmaculado_corazon` | Recorridos | 7 steps | Sister Lucía's *five* classes of offenses (1930) + the promise + the traditional consecration |
| `escapulario` | Oraciones breves | 1 (sheet) | The scapular's promise, ES/EN/LA |
| `espiritu_santo_novena` | Recorridos | 5 steps × 9 days | *Veni Creator Spiritus* antiphon + a per-day intention |

**Do not reproduce the full *Veni Creator Spiritus* from memory.** Only the
antiphon is quoted; that is the line the novena is built around and it is
reliable. The Spanish of the whole hymn was not verifiable here.

## Registries — add a devotion in one place, not six

Three hardcoded lists caused the original drift. All are now data:

- `hidesRosaryPills(misterioActual)` — who drops the four mystery pills.
  `BookletView` no longer computes this from four separate predicates.
- `earnsRoseForDevotion(misterioActual)` / `NON_ROSE_DEVOTIONS` — the rose guard,
  applied to **both** the Libro and `/rosario` handlers. `RosarioVirtualView`
  calls `buildSequence(misterioActual)` with shared AppShell state, so it could
  genuinely reach the novena and log roses the Libro suppressed. The drift was
  reachable, not theoretical.
- `NOVENA_DEVOTIONS` — `{ total, dayStepId }` per novena; drives
  `isNovenaMode()`, `getNovenaDays()`, the header picker, the `Día N de M`
  breadcrumb, the share card and the `?dia=` deep link. Replaced five hardcoded
  `'divinamisericordia_novena'` checks. Adding Espíritu Santo needed **zero**
  chrome changes.

## Two bugs found along the way

**1. Voice clip ids collapse.** `clipCandidates` in `bundledVoiceMap.js` and
`clipFileId` in `dumpFishEsMissing.test.js` both treat `PREFIX_N` as a numbered
variant of `PREFIX`. Correct for a repeated litany step, wrong when each step has
its own words. The five offenses were `IC_OFENSA_1..5`, so four of them would have
played offense #1's audio against different on-screen text. Renamed to
`IC_OFENSA1..5`. `bookletDevotionRegistry.test.js` now fails on any step with
unique text that uses a collapsible shape.

**2. `getSpeakablePrayerText` truncated mid-sentence.** It stripped the title on a
bare prefix match, so title `"Ven, Espíritu Santo"` against body
`"Ven, Espíritu Santo, llena los corazones…"` produced `", llena los corazones…"`
— a silently broken clip, and the baker would have baked it. It now only strips a
genuine heading (title alone, or title then newline/dash/colon). **This affects
runtime TTS for any unbaked prayer, not just the dumper.**

## Declared voice debt

`AWAITING_BUNDLED_VOICE` in `src/utils/voiceCoverage.js` lists devotions whose
data merged before their clips were baked. Asserted in both directions:

- every uncovered devotion must be declared (`findUndeclaredVoiceDebt`)
- every declared entry must still be uncovered (`findStaleVoiceDebt`)

So the list cannot rot, and dropping a devotion in without either baking clips
or declaring the debt fails CI. `findSmallestDevotionLackingBundledVoice` already
had an `excludeIds` parameter with no caller feeding it; the declared list is
now that caller.

**13 clips queued** in `scripts/fish-es-missing.json`. To bake:
Fish TTS on `:8080` + the `catts` checkout, then
`python scripts/bake_fish_es_missing.py` → `node scripts/genBundledVoiceMap.js`.

## Left undone, deliberately

**San José stays `soon`.** The repo holds no San José art. The one
Joseph-adjacent file is
`public/gallery-images/litany/modooscuro/christe-eleison Christ as King and Ruler _ File_Toomyvara St_ Joseph's Church Window Tu Rex Gloriae Christe by.jpg`
— a *Christ the King* window. It is in-repo stained glass and would match the
house style, but it depicts Christ, not Joseph, and agents.md says never merge an
image-less prayer. The catalog entry carries `blockedBy` with the folder and
prayer ids to create.

## Verification

`npm test` (56 suites / 359 tests) · `npm run build` (compiled, no warnings).

Two scanners were used ad hoc to catch corrupted string literals in the new
prayers (mixed scripts / mojibake) and are worth re-running after editing
liturgical text: walk `src/` for CJK/Cyrillic/Greek/Hebrew/Arabic/Devanagari/
Thai codepoints, Latin-Extended letters, and U+FFFD. Both reported clean.
