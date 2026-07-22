# Cat Audio Engine — Rosario Cards (Fase 0)

**Spec:** `CAT_AUDIO_ENGINE_SPEC.md` (repo root) · **App phase:** 5 (after contracts + engine + Cathedral pilot)  
**App version at audit:** `0.3.64` · **Date:** 2026-07-21  
**Scope of this doc:** Rosario only — no UI redesign, no engine fork.

## Verdict

Ready for **adapter design**, not for engine integration yet. Local voice path works (Liber ▶ + IDB + TTS fallback). Spec v1 **forbids browser TTS in normal use** and requires a shared headless player + CatTS manifests. Gap is intentional until Fase 1–4 land elsewhere.

| Spec piece | Rosario status |
|------------|----------------|
| Shared `audio-engine` package | **Absent** — do not copy; wait for `0.1.x` from CatTS monorepo |
| Manifest / NarrationDocument | **Absent** |
| Adapter (queue from session) | **Not started** — natural home: thin util + Liber control |
| Pre-generated MP3 assets | **Empty** — `BUNDLED_VOICE_BY_ID = {}` |
| Repeat Ave ×10 → one asset | **Conceptually aligned** with `prayerId` reuse; not wired to queue |

## 1. Canonical text

| Concern | Reality |
|---------|---------|
| Builder | `buildSequence(mysteryType, options)` → `src/utils/bookletSequence.js` |
| Rosary keys | `RosarioPrayerBook` sequences `RGo` / `RDo` / `RGl` / `RL` (ID lists) |
| Step shape | `{ id, title, text, img, imgCandidates, variants?, verses?, sections? }` |
| Speech ≠ title | `getSpeakablePrayerText(step)` — `src/utils/speakablePrayerText.js` (maps to `displayText` / `speechText`) |
| Works (mystery / devotion) | `BOOKLET_MYSTERY_IDS`: 4 mysteries + misericordia + novena + marian + sangre preciosa + vías + Sagrado Corazón |

**Suggested `work.id`:** `rosario.<mysteryType>` (e.g. `rosario.dolorosos`).  
**Suggested `asset.id` / block:** stable prayer semantic id (`A`, `P`, `MD3`, `SC`, …) — **not** `sequenceIndex`.

## 2. ID stability (risk)

| ID | Stable? | Notes |
|----|---------|-------|
| Prayer base `id` (`A`, `P`, `G`, `F`, mysteries…) | **Yes** for classic rosary | Same id repeated in sequence — correct for shared assets |
| `sequenceIndex` | **Positional only** | Used today for Tier-S slot key `${mystery}:${sequenceIndex}` — fragile if apertura toggles / novena options change length |
| `${id}_${idx}` (sangre preciosa chaplet) | **Weak** | Index baked into id; prefer base `PB_P` + instance for CatTS |
| Litany verses | Nested under parent `verses[]` | Parent step keeps one `id` (e.g. LL); verse index is secondary locator — see `.docs/litany/audio-integration.md` |
| Novena day intention | Same id, text varies by `novenaDay` | Needs `revision` / content hash in asset, or `assetId` per day |

**Migration before Fase 5:** export `NarrationBlock[]` with stable `blockId` = prayer semantic id (+ verse index for litany). Queue builder emits N `QueueItem`s with distinct `instanceId` pointing at one `assetId`.

## 3. Current audio stack (keep vs replace)

```text
SFX (keep)          audioManager.js + bookletSounds / soundEffects / CosmicResonator
                    Web Audio chimes — OUT of Cat Audio Engine (spec excludes Web Audio for long voice)

Voice (replace path) prayerVoicePlayback.js
                    Liber ▶ FSM in BookletView + PrayerRecorder
                    Priority: Tier S (IDB) → bundled WAV → speechSynthesis en-US

Legacy hook         usePrayerVoiceAutoplay — RosarioVirtualView forced enabled:false
Studio              /voz RecordingStudioView → prayerRecordingStore (IndexedDB)
Prefs               voicePrefs.js (localStorage)
Map                 bundledVoiceMap.js — empty until CatTS / EN packs
```

**User play today:** Liber title ▶ → `once` → `auto` (advance) → off. First gesture unlocks autoplay of the queue-like step advance. Aligns with spec “blocked until Play”.

**Criterion #3 conflict:** normal Liber path still uses browser TTS when no clip. Fase 5 must prefer CatTS assets only; TTS may remain as explicit debug/fallback, not default.

## 4. Persistencia / PWA / routing

| Area | Reality |
|------|---------|
| Progress (voice) | None for Cat engine; Liber is session FSM only |
| Clips | IndexedDB `rosario_prayer_recordings_v1` |
| Prefs / stats / sync | localStorage + optional jsonblob (`useCloudSync`) |
| PWA | `public/service-worker.js` — shell + cache-first; **no** dedicated `/voice` or manifest offline plan |
| Routes | AppShell: `/libro`, `/rosario`, `/voz`, … — player must be **root-persistent** (not unmounted with Libro) |
| Package manager | **npm** + CRA (`react-scripts`) — spec says Yarn for CatTS platform; Rosario stays npm until monorepo decides |

## 5. Adapter sketch (Fase 5 — do not implement yet)

1. `buildSequence` → list of `{ assetId, title, speechText, source: { scheme:'block', contentId, startBlockId } }`.
2. Expand repetitions: ten `A` → ten `QueueItem`s, same `assetId`, new `instanceId` each.
3. `replaceQueue` on mystery change / Liber play; Liber ▶ maps to `play` / pause / stop + optional `setRepeat('queue')`.
4. On `current` change: drive existing `displayIndex` / litany verse (highlight only — outside core).
5. Mount `AudioEngineProvider` once in `AppShell` / `index.js`; **one** persistent `HTMLAudioElement`.
6. Do **not** put play logic inside bead physics or page-count UI.

## 6. Blockers / handoffs

| Blocker | Owner | Action |
|---------|-------|--------|
| Contracts + engine `0.1.x` | CatTS monorepo | Fase 1–2; Rosario consumes package, never vendors source |
| Incremental MP3 + manifest | CatTS | Generate per prayer semantic id; immutable URLs |
| Empty `BUNDLED_VOICE_BY_ID` | CatTS → Rosario | Fill map **or** load remote `manifest.<rev>.json` (prefer manifest) |
| Cathedral pilot | Cathedral | Spec Fase 4 before Rosario |
| Litany cues vs per-verse files | Shared | Decide in contracts; handoff notes in `.docs/litany/audio-integration.md` |
| CatTS repo path | Ops | Not found under `REACTJS/` as `catts` at audit time — confirm monorepo location |

## 7. Explicit non-goals (this repo, now)

- Implement / copy `packages/audio-engine`
- Redesign Liber or BottomNav
- Switch CRA → Yarn solely for the engine
- Delete SFX `audioManager` (orthogonal)
- Promise silent autoplay on cold load

## 8. Next Rosario checklist (when unblocked)

1. Depend on fixed `audio-engine` / `audio-engine-react`.
2. Add `src/audio/rosarioAudioAdapter.js` (queue from `buildSequence` + speakable text).
3. Wire Liber ▶ to engine API; keep chrome in `PrayerRecorder`.
4. Persist queue/progress per `workId` (IndexedDB).
5. Fixture test: 10× Ave → one network asset, ten `instanceId`s.
6. Gate browser TTS behind prefs; default off once manifests exist.
7. Update `.docs/libro/voice-autoplay.md` + `releaseNotes` when shipping.
