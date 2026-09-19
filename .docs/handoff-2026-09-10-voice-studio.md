# Handoff 2026-09-10 — Sound Studio: human voice replaces the TTS pack

Goal: gatrivi records every prayer with a real mic; the TTS "Fish" pack
(`public/voice/{es,en}/*.wav`, 170 + 117 clips baked by `scripts/bake_fish_*.py`)
becomes the fallback, not the voice. This session prepared the studio: fixed
playback priority, added take export, and generated the recording cue sheet.
Local only, not deployed.

## The pipeline (end to end)

```
record (mic in /voz, or DAW → import)
  → IndexedDB rosario_prayer_recordings_v1 (store "clips"; slot keys
    `${mystery}:${index}` + prayer keys `${prayerId}:v${n}`, voiceLang-tagged)
  → playStepVoice()  ← single choke point for every spoken prayer
      Tier S (your take) → Tier 3 (bundled Fish wav) → browser TTS (off by default)
  → later, bake: download takes → normalize → public/voice/{lang}/ →
      node scripts/genBundledVoiceMap.js → regenerates src/data/bundledVoiceMap.js
```

Playback callers: `BookletView.jsx` (Liber ▶ once/auto FSM, `preferBundled: true`,
mystery + displayIndex passed) and `OptionalPrayerSheet.jsx` (`mystery: null`).
AUTO progression (`finishVoiceResult`) advances on any non-cancelled result, so a
missing clip (`{ended:true, source:'fish-miss'}`) still moves on — preserved.

## What changed this session

1. **Tier S actually plays now (the blocker).** `playStepVoice`
   (`src/utils/prayerVoicePlayback.js`) used to short-circuit the `preferBundled`
   branch straight to the bundled wav, so studio takes never played in the Liber.
   Now every mode resolves the user take first (`pickUserTake`: slot lookup when
   mystery+index are known, else latest take for the prayerId — new
   `pickRecordingForPrayer` in `prayerRecordingStore.js`), then bundled, then the
   fish-miss contract. Language filter now applies (`voiceLang`; legacy takes
   without it count as `'es'`). `blobToObjectUrl` returns null instead of throwing
   when object URLs are unavailable; `playAudioUrl`'s finish path guards
   `revokeObjectURL` like `stopStepVoice` already did.
2. **Takes can leave IndexedDB.** `RecordingStudioView` (`/voz`): per-take ↓
   button in the session clip list + "Exportar tomas" in the map actions
   (downloads all takes, filenames `prayerId_slot_lang_id.ext`). Also fixed two
   `Â·` mojibake strings in the studio chrome.
3. **Cue sheet generator.** `src/__tests__/dumpAudioCoverage.test.js` (pattern of
   `dumpFishEsMissing`) walks every sequence in `BOOKLET_MYSTERY_IDS` +
   `OPTIONAL_PRAYERS`, aggregates unique clips by how often each is prayed, and
   writes `scripts/audio-coverage.json` + **[.docs/voice-cue-sheet.md](../.docs/voice-cue-sheet.md)**
   (158 unique clips ≈ 43 min of audio, grouped Tier 1–5 with target filenames).
4. **Tests.** `prayerVoicePlayback.test.js` gained a "Tier S priority" suite:
   take beats Fish pack, language fallthrough, slot-less (optional) prayers,
   and `useUserVoice: false` keeps the guide.

## Recording session order (the low-hanging fruit first)

Full checklist with texts: `.docs/voice-cue-sheet.md`. Session 1 = the Big 7
(`A`, `P`, `G`, `F`, `SC`, `AC`, `C`) — 71 of ~79 steps of any rosary. Then `MP`
(100 plays/chaplet set) + `EF` + `HG` (Divine Mercy), then the 20 mystery
meditations, litany, devotions. Record Spanish first.

Workflow: either record directly in `/voz` ("Rezar y grabar" walks missing slots)
or record 48 kHz mono WAV masters in a DAW named by clip id and import them per
slot (↑ button). Use ↓ / "Exportar tomas" to get takes onto disk for baking.

## Hazards found by the audit (fix before/while baking)

- **Gloriosos plays Gozosos audio.** `mysteries.gloriosos` reuses ids `MG1`–`MG5`
  (same as gozosos) with different texts; the alias table resolves them to
  `m1`–`m5` (gozosos clips). The gloriosos recordings `m11`–`m15` exist on disk
  and the aliases `MGl1→m11`…`MGl5→m15` are ready in `scripts/genBundledVoiceMap.js`
  but never receive those ids. Fix: rename gloriosos ids to `MGl1`–`MGl5` in
  `RosarioPrayerBook.js` (audit `MG` consumers first — VerseDrawing traits,
  ScriptureMappings, tests). Record new gloriosos takes as `m11`–`m15`.
- **`Papa.wav` holds the Salve.** `S` and `Papa` both resolve to it; the Oración
  por el Papa has no clip. Record `Salve` + `Papa` separately, split the aliases
  when baking.
- **Letanía** is one `LL` clip today; per-chunk pattern is `LL_0`–`LL_5`.
- **Preciosa Sangre** uses a longer Padre Nuestro / Gloria than the shared clips
  (see conflicts in the cue sheet) — a human `P`/`G` covers the rosary, the
  chaplet variants can come later.

## Bake checklist (Phase 3, when takes are ready)

1. Export takes (↓) or collect DAW masters; normalize (mono, peak ≈ −3 dB) and
   re-encode if needed.
2. Drop files into `public/voice/es/` using the cue-sheet filenames (they match
   the existing Fish pack, so old clips are overwritten in place).
3. `node scripts/genBundledVoiceMap.js` to regenerate `src/data/bundledVoiceMap.js`
   (it unions `git ls-files` with disk, so uncommitted clips register). Note it
   filters `.endsWith('.wav')` and `resolveBundledVoiceUrl` hardcodes `.wav` —
   switching to mp3/opus means touching both.
4. Update the `MG→MGl` / Salve-Papa aliases, then re-run
   `dumpAudioCoverage` and `bundledVoiceMap.test.js` (coverage asserts live there).
5. Bump `public/service-worker.js` `CACHE_NAME` (audio is network-first runtime-
   cached under `/voice/`, nothing precached) + `APP_VERSION`/`releaseNotes`.

## Not touched (and why)

- `usePrayerVoiceAutoplay` stays legacy/`enabled:false` (`RosarioVirtualView`);
  it has its own picker call, unchanged.
- Browser TTS remains opt-in and last resort (`useBrowserTts: false` default).
- Synth chimes/ambience (`audioManager`, `bookletSounds`, soundscape) are a
  separate system — unaffected.
- The MG id rename itself: data change in the central prayer book, needs a
  consumer audit; scheduled with the bake, not sneaked in here.
