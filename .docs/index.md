🔥🔥🔥 IMPORTANT: EVERY VERSE MUST END WITH A LINE BREAK (\n). 🔥🔥🔥

# Rosario Cards — Documentation Index & Architecture Portal

**Canonical context for bots and men.**  
*Clean, model-efficient, strongly typed links, and complete architectural invariants.*

- **Production URL:** [https://rosario.gatrivi.com](https://rosario.gatrivi.com) *(prefer this over vercel preview URLs for share/deep links)*
- **Current Version:** `v0.3.88 — La Hora de la Misericordia` (Source of truth: [`src/data/releaseNotes.js`](../src/data/releaseNotes.js) → `APP_VERSION`)
- **Git Branch:** `cloud-rosary-v2` · Work policy: *No commit gate — commit and push freely; we dev in prod.*
- **Core Stack:** React 19 · CRA (`react-scripts 5.0.1`) · `react-router-dom v7` · Matter.js · Web Audio API · IndexedDB / jsonblob sync

---

## 1. Handoff Ledger (Chronological Progression)

Every major milestone and session is documented in a dedicated handoff note:

| Date | Version / Name | Core Focus & Artifacts | Handoff Document |
|------|----------------|------------------------|------------------|
| **2026-10-25** | `v0.3.89` · Descriptores Sagrados | ~320 slug images renamed, library anti-repetition audit (+1,000%–7,600% richness, 0% repeats in 53 Ave Marías) | [handoff-2026-10-25-image-catalog-and-slug-renaming.md](./handoff-2026-10-25-image-catalog-and-slug-renaming.md) |
| **2026-10-12** | `v0.3.88` · La Hora de la Misericordia | Chaplet in Rosa (64 steps, `mercy_heart`), drag gesture consistency, single-pass Amén, SacredDust throttling | [handoff-2026-10-12-la-hora-de-la-misericordia.md](./handoff-2026-10-12-la-hora-de-la-misericordia.md) |
| **2026-09-26** | `v0.3.87` · La Vidriera | Vitral variety (53 distinct Ave Marías, 49 Divine Mercy), Letanía 100/100 404 repair scripts | [handoff-2026-09-26-la-vidriera.md](./handoff-2026-09-26-la-vidriera.md) |
| **2026-09-26** | `v0.3.86` · El Estante | Devotions shelf single source of truth (`historicDevotionsCatalog.js`), 5 devotions shipped | [handoff-2026-09-26-el-estante.md](./handoff-2026-09-26-el-estante.md) |
| **2026-09-10** | `v0.3.85` · Estudio de Voz | Audio cue sheets, voice recording studio (`/voz`), Tier 1–3 coverage | [handoff-2026-09-10-voice-studio.md](./handoff-2026-09-10-voice-studio.md) |
| **2026-09-09** | `v0.3.84` · Rosas que Recuerdan | Rose fingerprints (`roseFingerprint.js`) with prayer context (dwell, daylight, hour, source) | [handoff-2026-09-09-rose-fingerprints.md](./handoff-2026-09-09-rose-fingerprints.md) |
| **2026-09-09** | Navigation Seams | Seams between Libro, Rosa, Rosedal and Rosary views | [handoff-2026-09-09-navigation-seams.md](./handoff-2026-09-09-navigation-seams.md) |
| **2026-09-06** | Matter Rosary | Usable physics rosary, artwork transitions restored, double-tap zoom | [handoff-2026-09-06-matter-rosary.md](./handoff-2026-09-06-matter-rosary.md) |
| **2026-09-05** | Sound System | Procedural audio chimes, lazy initialization | [handoff-2026-09-05-sound.md](./handoff-2026-09-05-sound.md) |
| **2026-09-05** | Rosary Interaction | Bead drag, selection and touch targets | [handoff-2026-09-05-rosary-interaction.md](./handoff-2026-09-05-rosary-interaction.md) |
| **2026-09-05** | Session Plan | Layout consolidation and audio effects roadmap | [handoff-2026-09-05-next-session.md](./handoff-2026-09-05-next-session.md) |
| **2026-09-04** | Rosa Mechanics | RoseView, SacredText, SVG drawing, garden resume, Patrick devotion | [handoff-2026-09-04-rosa.md](./handoff-2026-09-04-rosa.md) |
| **2026-08-26** | Rosa Repair | Hold-to-pray z-index layout above nav, pointerup release guarding | [handoff-2026-08-26.md](./handoff-2026-08-26.md) |
| **2026-08-21** | Architecture Baseline | Work policy, dev in prod, Vercel flow optimization | [handoff-2026-08-21.md](./handoff-2026-08-21.md) |
| **2026-08-14** | Mid-August Update | Art registry and devotions sync | [handoff-2026-08-14.md](./handoff-2026-08-14.md) |
| **2026-08-11** | Early August Baseline | Fish ES Voice 4 lock, initial audio pipelines | [handoff-2026-08-11.md](./handoff-2026-08-11.md) |

---

## 2. Documentation Directory Map

```text
.docs/
  index.md                                ← Canonical documentation index (you are here)
  ui-ux-principles.md                     ← Touch targets, WCAG AA, readability & sheet ergonomics
  voice-cue-sheet.md                      ← 171 unique audio clips for human voice recording
  upcoming.md.txt                         ← Pointer to releaseNotes.js & future-features.md
  architecture/
    current-stack-jun-2026.md             ← Live system architecture, views, routing & component inventory
    app-layout.md                         ← Frame, spacing, toolbar & overlay ownership
    cat-audio-engine-rosario-map.md       ← Fase 0 Cat Audio Engine mapping for Rosario
    architecture-overview.md              ← High-level structural baseline
    live-system-snapshot.md               ← Pre-recovery monolith detail (historical)
    resonator-and-physics-blueprint.md    ← Rosary stabilization & offline Web Audio soundscape
  libro/
    historic-devotions.md                 ← 16 historic Christian devotions catalog & calendar
    prayer-images.md                      ← Stained glass vitral background rules & folder conventions
    devotions-surfaces-redesign.md        ← UX overhaul for shelf devotions and recorridos
    devotion-playlist.md                  ← Multi-devotion playlist queue architecture
    voice-autoplay.md                     ← Audio playback guide in Libro & Rosario
  voice/
    fish-es-lock.md                       ← Fish ES Voz 4 lock (seed 77) — strict standard
    fish-en-liber.md                      ← English voice guide mapping
  virtual-rosary/
    interaction-rules.md                  ← Bead/chain selection rules & touch constraints
    topology-current.md                   ← Production vs v4 canonical constraint graph
    physics-blueprint-v4.md               ← Formal v4 JSON topology for 61 beads
    physics-stable-archive.md             ← Archived Matter.js physics module
    rosary-ux-recovery-jun-2026.md        ← Rosary UX recovery post-mortem
  visual/
    visual-modes.md                       ← Chiaroscuro (modooscuro) vs Vitral (stained glass)
  sacred-cosmic/
    cosmic-modulator.md                   ← Mathematical cosmic modulation specifications
    sacred-edition-overview.md            ← Sacred Edition aesthetic overview
  roadmap/
    future-features.md                    ← Difficulty-ranked backlog (Tiers 1–5)
    native-android-kotlin-budget.md       ← Android Native (Kotlin/Compose) architecture budget
  litany/
    index.md                              ← Letanía Lauretana roadmap & overview
    data-model.md                         ← Litany verses, sections and closing structure
    assets-and-images.md                  ← Litany artwork mappings
    views-integration.md                  ← Litany UI rendering across surfaces
    audio-integration.md                  ← Two-voice audio engine specifications
    known-issues.md                       ← Historical issue verification log
  dev-notes/
    session-report-2026-07-03-night.md    ← Art sync, Firebase scaffold, Vía Crucis/Lucis
    beads-dom-prototype.md                ← DOM-based bead prototype notes
    rosary-dom-physics-prototype.md       ← DOM physics prototype notes
    legacy-agent-prompts/                 ← Historical agent prompts (GEMINI, kimi, etc.)
  product/
    overview.md                           ← High-level product vision
    commercial-readiness.md               ← Production readiness gaps & decisions
    lujan-2026-launch.md                  ← Luján pilgrimage target & offline requirements
    nearby-cloistered-monasteries-olivos.md ← Monasteries reference data
  todos/
    view-prayers-todo.md                  ← Legacy ViewPrayers cleanup checklist
```

---

## 3. Fast Topic Navigation (Where to find what)

| Topic | Relevant Documentation | Code Source of Truth |
|-------|------------------------|----------------------|
| **Current Stack & System Inventory** | [`architecture/current-stack-jun-2026.md`](./architecture/current-stack-jun-2026.md) | [`src/components/Layout/AppShell.jsx`](../src/components/Layout/AppShell.jsx) |
| **Historic Devotions Shelf** | [`libro/historic-devotions.md`](./libro/historic-devotions.md) | [`src/data/historicDevotionsCatalog.js`](../src/data/historicDevotionsCatalog.js) |
| **Vitral Art & Folder Manifest** | [`libro/prayer-images.md`](./libro/prayer-images.md) | [`scripts/build-prayer-image-manifest.js`](../scripts/build-prayer-image-manifest.js), [`src/utils/prayerImages.js`](../src/utils/prayerImages.js) |
| **Rose Fingerprints (`context`)** | [`handoff-2026-09-09-rose-fingerprints.md`](./handoff-2026-09-09-rose-fingerprints.md) | [`src/utils/roseFingerprint.js`](../src/utils/roseFingerprint.js), [`src/components/Views/VerseDrawing.jsx`](../src/components/Views/VerseDrawing.jsx) |
| **Rosa Gesture Contracts** | [`handoff-2026-10-12-la-hora-de-la-misericordia.md`](./handoff-2026-10-12-la-hora-de-la-misericordia.md) | [`src/components/Views/RoseView.jsx`](../src/components/Views/RoseView.jsx), [`src/components/Views/SacredText.jsx`](../src/components/Views/SacredText.jsx) |
| **Matter.js Physics Rosary** | [`virtual-rosary/interaction-rules.md`](./virtual-rosary/interaction-rules.md) | [`src/components/RosarioNube/InteractiveRosary.jsx`](../src/components/RosarioNube/InteractiveRosary.jsx) |
| **Audio Voice Guidance** | [`voice-cue-sheet.md`](./voice-cue-sheet.md), [`voice/fish-es-lock.md`](./voice/fish-es-lock.md) | [`src/utils/prayerVoicePlayback.js`](../src/utils/prayerVoicePlayback.js) |
| **UI & Touch Ergonomics** | [`ui-ux-principles.md`](./ui-ux-principles.md) | [`src/components/Layout/AppShell.css`](../src/components/Layout/AppShell.css) |
| **Backlog & Future Features** | [`roadmap/future-features.md`](./roadmap/future-features.md) | [`src/data/releaseNotes.js`](../src/data/releaseNotes.js) (`UPCOMING`) |
| **Native Android Budget** | [`roadmap/native-android-kotlin-budget.md`](./roadmap/native-android-kotlin-budget.md) | Evaluative |
| **Cat Audio Engine Spec** | [`architecture/cat-audio-engine-rosario-map.md`](./architecture/cat-audio-engine-rosario-map.md) | [`CAT_AUDIO_ENGINE_SPEC.md`](../CAT_AUDIO_ENGINE_SPEC.md) |
| **Verification & Known Issues** | [`litany/known-issues.md`](./litany/known-issues.md), [`ERRORS.md`](../ERRORS.md) | Verified in code |

---

## 4. Invariants for Bots and Agents

When modifying or generating code in this repository, you **MUST** follow these invariants:

1. **Verse line breaks:** Every prayer verse string in `src/data/` must end with a newline character (`\n`).
2. **Mandatory images:** Every prayer step in any sequence must have `img` and non-empty `imgCandidates` (see [`.cursor/rules/prayer-images.mdc`](../.cursor/rules/prayer-images.mdc)).
3. **Rose fingerprint retention:** Never drop or omit `verseTraits` or `context` during save, sync, or render. Legacy fingerprints must render byte-identically.
4. **Rosa screen responsiveness:** Do NOT introduce per-frame work on the Rosa screen (keep SacredDust timer-paced, measure bounding boxes once per gesture into `rectCacheRef`).
5. **No commit gate:** We develop directly on `cloud-rosary-v2` and deploy to production on Vercel. Commit work when completed.
6. **Windows test execution:** Always run tests with `--maxWorkers=2` (`npm test -- --watchAll=false --maxWorkers=2`) to prevent Node heap OOM.
7. **Version badge & release notes:** On every version bump, update `src/data/releaseNotes.js` (`version`, `name`, `CURRENT`, `UPCOMING`). The version badge must render visibly in the UI.
