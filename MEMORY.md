# MEMORY — Major Architectural Decisions

Log: **What / Why / Rejected**. Agents append brief entries after non-trivial decisions.

---

- **2026-10-12** — **Rosa Devotions & Gesture Contracts (v0.3.88):**
  - *What:* Generalized Rosa devotions (`/rosa?devocion=patrick|misericordia`). Divine Mercy chaplet runs 64 steps with `mercy_heart` symbol. Single-pass Amén with `PRAYER_COMPLETE_BEAT_MS` (700ms). SacredDust canvas throttled to ~20fps.
  - *Why:* Devotions needed contemplation mode without polluting global rosary cursor or rose counts. Pointer drag was lagging due to unthrottled main-thread render loop.
  - *Rejected:* Re-measuring word boxes on `pointermove` (now cached once per gesture in `rectCacheRef`).
- **2026-09-26** — **Vitral Variety & 404 Forensics (v0.3.87):**
  - *What:* Repaired Letanía 100/100 paths without moving files (copy only). Expanded Ave María rotation across 53 distinct vitrales and Divine Mercy across 49 images.
  - *Why:* Repetitive 3-image cycling and dead 404 slots broke devotional immersion.
  - *Rejected:* Fuzzy path matching or moving files out of historical folders (agents.md rule: copy instead).
- **2026-09-26** — **Devotions Catalog Single Source of Truth (v0.3.86):**
  - *What:* Refactored `src/data/historicDevotionsCatalog.js` to define explicit surfaces (`vias`, `recorrido`, `breve`, `embedded`, `soon`) and validated `targetId`s in CI. Shipped 5 devotions.
  - *Why:* Old boolean `status: 'have'` drifted from reality and lacked automated verification.
  - *Rejected:* Hardcoding devotion names across multiple view switches.
- **2026-09-26** — **Folder-based Curated Prayer Art (v0.3.85):**
  - *What:* Users/curators drop art into `public/prayers/<PRAYER_ID>/`; prestart script compiles `src/data/prayerImageManifest.json`.
  - *Why:* Direct file-drop curation avoids editing JS registries for simple image additions.
  - *Rejected:* Moving files out of `src/data/assets` or `public/gallery-images`.
- **2026-09-09** — **Context-Aware Rose Fingerprints (v0.3.84):**
  - *What:* Every Ave María records `context` (source, dwellMs, hour, daylight band, decade, guided) inside `roseFingerprint.js`.
  - *Why:* Devotion roses should remember how and when they were prayed.
  - *Rejected:* Dropping legacy traits or altering past fingerprint rendering (must remain byte-identical).
- **2026-08-07** — **Fish ES Voice Lock:**
  - *What:* Locked Spanish audio guide model to Fish ES Voz 4 (seed 77).
  - *Why:* Consistent, contemplative timbre across all devotion recordings.
  - *Rejected:* Browser `speechSynthesis` for default prayer audio.
- **2026-07-03** — **Firebase Art Library & jsonblob Stats:**
  - *What:* Art renames/uploads use Firebase `shared/artConfig` + `shared/imageLibrary`. jsonblob remains fallback for stats.
- **2026-07-03** — **Documentation Canonical Path:**
  - *What:* Canonical docs under `.docs/` (not `docs/`). Stack locked to CRA `react-scripts` 5 and `react-router-dom v7`.
