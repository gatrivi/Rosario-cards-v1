# Commercial readiness — gaps, decisions, plan (2026-08-21)

Companion to [handoff-2026-08-21.md](../handoff-2026-08-21.md). Status after pass #1
(rebased onto origin v0.3.81; 207/207 tests green; pushed).

**Launch frame:** Luján 2026 pilgrimage Oct 3–4 (see [lujan-2026-launch.md](./lujan-2026-launch.md)).
Free for pilgrims; donations optional and non-blocking; monetization for non-pilgrims
deliberately undecided. Gap priorities below are ordered by Luján impact.

## Gap board

| # | Gap | Solve now? | Why / plan |
|---|-----|-----------|------------|
| 1 | **Audio deploy weight** — build/ 465 MB (343 MB WAV + 68 MB gallery) | **LATER (next session)** | Highest user win (10× smaller with Opus/AAC) but touches `bundledVoiceMap` URLs + tests; deserves a dedicated session with bake/regen + E2E. Plan: transcode `public/voice/**` → `.opus` (~64 kbps), keep WAV as source-of-truth in git LFS or a `_wav_master/` dir, update map generator to emit both, SW cache-bust. |
| 2 | **EN voice 112 clips missing** | **LATER** | Needs overnight Fish EN bake on CatTS (`scripts/fish-en-missing.json` is the manifest). Same flow as the 15 ES VCR clips done 2026-08-21. 41 steps have no EN text at all (`skipped_no_en_text`) — those need translation first. |
| 3 | **Firebase rules wide open** (`firestore.rules`, `storage.rules`: `write: if true`) | **LATER — do NOT edit blindly** | Rules only take effect when deployed from Firebase console; tightening now would break Estudio de imágenes/voz uploads (no auth wired yet). Proper fix = anonymous auth + owner-scoped rules, one session together with console access. Until then: risk is strangers uploading junk to the art buckets — acceptable while user count ≈ 0. |
| 4 | **Image licensing** | **PARTIAL NOW** (see policy below) | Sacred art itself is centuries old and PD; the *photos/scans* may carry rights. See policy. |
| 5 | **Privacy page** | **LATER (small)** | Needs one decision (what we tell users about jsonblob + Firebase) then a static page + footer link. Do together with #6. |
| 6 | **jsonblob sync dependency** | **KEEP for now** (decided 2026-08-21) | Not malware — see "How sync works". Migration to Firebase is the real fix but drags auth in; defer until users exist. |
| 7 | **Repo weight** (.git pack 584 MB) | **LATER** | Only hurts collaboration/clones. Fresh repo or LFS when a second dev joins. |

## Image licensing policy (decision)

Sacred art depicts what belongs to every believer — but copyright law attaches to
**specific photos/scans**, not to the scene. Practical rule set:

1. **Old masters (Doré, Caravaggio, Rubens, medieval/renaissance, icons):** the 2D
   paintings are public domain. Safe **if the reproduction comes from a PD source**
   (Wikimedia Commons `PD-old`, museum open-access programs).
2. **Twitter-scraped photos** (`H*.jpg` filenames — monks, nuns, churches): the
   *photographer* holds rights even if the subject is sacred. These are the risky set.
3. **Action:** keep shipping for now (giveaway, no monetization), but:
   - New art must come from Wikimedia/museum open-access with source noted.
   - Log risky files in `notes/image-provenance.md` as they're touched.
   - Before ever selling: batch-replace risky photos with PD equivalents
     (search by subject; same iconography exists in PD forms).

## How cloud sync works (fact sheet, 2026-08-21)

- `src/hooks/useCloudSync.js` POSTs/PUTs JSON to `https://jsonblob.com/api/jsonBlob`.
- First use creates an anonymous blob; its ID is saved in `localStorage.rosario_sync_id`
  (= the "llave de peregrinación" shown in Ajustes). User can copy it to move devices,
  or paste another key to import.
- Payload = prayer counters only: `totalAveMarias`, `dailyAveMarias`, `todayDate`,
  `nivelActualId`, `rosedal_roses` (last ~500 rose events), plus shared `artConfig`
  (image assignments). No names, emails, or location unless the user types them into
  rose notes themselves.
- **Not malware**: no code execution, no tracking, no third-party scripts — jsonblob is
  a dumb free JSON bucket, used here as a zero-cost sync backend.
- Real risks: (a) anyone holding the key can read/write that blob (feature AND weakness),
  (b) jsonblob can vanish/rate-limit → app silently falls back to localStorage
  (`syncStatus: 'local'`), nothing breaks offline.
- **Decision:** keep jsonblob until real users; revisit Firebase-backed sync (already an
  optional dep) when accounts matter.

## Order of attack next sessions

1. Audio transcode (#1) — biggest UX win.
2. EN texts for the 41 untranslated steps → then EN bake (#2).
3. Privacy page + jsonblob disclosure (#5) — one sitting.
4. Firebase anonymous-auth + rules (#3) — needs console access.
