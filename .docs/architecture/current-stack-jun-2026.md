# Current Stack & System Architecture — Oct 2026 (v0.3.88)

> **Canonical System Reference**  
> **Live (prod):** [https://rosario.gatrivi.com](https://rosario.gatrivi.com) (Vercel custom domain; branch `cloud-rosary-v2`)  
> **Version:** `v0.3.88 — La Hora de la Misericordia` (defined in `src/data/releaseNotes.js` → `APP_VERSION`)  
> **Entry point:** `src/index.js` → `src/App.js` → `src/components/Layout/AppShell.jsx` (react-router v7)

---

## 1. Application Routing & Views (`src/navigation/routes.js` → `AppShell.jsx`)

All navigation passes through `AppShell.jsx` which renders the active view based on URL route and manages top chrome (PWA update toast, version badge, Ajustes modal, cloud sync status):

| View Key | Path | Component | Navigation Access | Role / Surface |
|----------|------|-----------|-------------------|----------------|
| `booklet` | `/libro`, `/` | `BookletView` | BottomNav | **Libro:** Contemplative stained-glass flipbook, devotions shelf, per-verse vitral art, voice guide playback |
| `rosary` | `/rosario` | `RosarioVirtualView` | BottomNav | **Rosario Virtual:** 61-bead interactive physics rosary (Matter.js), velvet settling, gesture magnetism ✝, double-tap zoom |
| `rose` | `/rosa` | `RoseView` | BottomNav | **La Rosa:** Hold-to-charge sacred text reading, deterministic vector rose generation (`roseFingerprint.js`), devotions mode |
| `voz` | `/voz` | `RecordingStudioView` | BottomNav | **Estudio de Voz:** Devotional audio recording, playback review, Fish TTS coverage inspection |
| `tracker` | `/plan` | `DailyTracker` | BottomNav | **Plan Diario:** Daily commitment selector (1/2/4/8 rosarios) with macetero visualizer |
| `camino` | `/camino` | `PeregrinacionView` | BottomNav | **Peregrinación:** Snake-map pilgrimage path connecting local church towards universal shrines |
| `macetones` | `/macetones` | `MacetonView` | via Camino / settings | **Macetones:** Daily commitments visualizer and garden portal |
| `jardin` | `/jardin` | `JardinDeRosasView` | via Macetones | **Rosedal:** Visual gallery of all planted roses rendered with context-aware ink |
| `reliquias` | `/reliquias` | `ReliquarioView` | via Camino | **Reliquiario:** Sacred devotions and medals overview |
| `playlist` | `/cola` | `DevotionPlaylistView` | via settings / dev | **Playlist:** Sequence queue for continuous multi-devotion playback |
| `assets` | `/assets` | `AssetStudio` | Ajustes → Estudio | **Estudio de Arte:** Liturgical categorization, verse assignment, rejected image review |
| `monk` | `/monk` | `MonkView` | hidden / dev | Monastic reflection prototype |

---

## 2. Devotions & Parameters (`BookletView` & `RoseView`)

The app supports comprehensive classic and historic devotions via query parameters:

- **Classic Rosary Mysteries:** `/libro?misterio=gozosos|dolorosos|gloriosos|luminosos`
- **Faustina Divine Mercy:**
  - In Libro: `/libro?misterio=divinamisericordia` (Corona) or `/libro?misterio=divinamisericordia_novena&dia=1..9` (Novena)
  - In Rosa: `/rosa?devocion=misericordia` (64-step Chaplet with `mercy_heart` symbol, independent cursor)
- **St. Patrick Breastplate:** `/rosa?devocion=patrick`
- **Historic Stations:** `/libro?misterio=viacrucis|vialucis`
- **Historic Recorridos:** `/libro?misterio=sagrado_corazon_adoracion|inmaculado_corazon|espiritu_santo_novena|medalla_milagrosa|memorare|sangrepreciosa_litany`
- **Oraciones Breves (Sheets):** `/libro?oracion=michael|expedito|escapulario|guardian|benedict|carmen`

---

## 3. Core Subsystems

### 3.1 Physics Rosary (`RosarioVirtualView` + `InteractiveRosary`)
- **Physics Engine:** Matter.js with 61 constrained physical bodies (1 crucifix, 1 central medal, 59 beads).
- **Feel:** High friction (`frictionAir: 0.06`), zero restitution (`restitution: 0.0`), differentiated bead masses for tactile velvet settling.
- **Interactions:**
  - Single tap: Selects bead and navigates prayer step.
  - Cross gesture: Drawing ✝ magnetically aligns scattered beads.
  - Double tap: Toggles bead zoom (2.5×) to thumb size for comfortable elderly touch.
  - Audio: Rings the Libro chime on prayer advance; lazy oscillator chimes on bead collision.
- **Layering:** Background vitral image (z=0) → Prayer text (z=5) → Matter.js canvas (z=20) → Chrome HUD (z=25+).

### 3.2 Sacred Rose & Gesture Contracts (`RoseView`, `SacredText`, `VerseDrawing`)
- **Hold-to-charge & Drag-reading:** User touches or drags over sacred text to illuminate words from silver to molten gold.
- **Gesture Contracts (v0.3.88):**
  - Unread letters share identical metrics with read letters (zero reflow on first touch).
  - Trailing punctuation rides with the last letter.
  - Bounding boxes are measured once per gesture (`rectCacheRef`), eliminating per-frame DOM querying.
  - Lifting inside the last word finishes the line; lifting at the end of the last verse completes the prayer.
  - Completed prayer stays illuminated for `PRAYER_COMPLETE_BEAT_MS` (700ms) before advancing cleanly in a single pass.
- **Rose Fingerprints (`src/utils/roseFingerprint.js`):**
  - Every completed Ave María generates a cryptographic-like deterministic visual fingerprint capturing: `source` (libro, rosario, rosa, manual), `dwellMs` (reading dwell duration), `hour` and `daylight` band, `decade` and `guided` state.
  - Stores up to 500 recent fingerprints in local storage and cloud sync.

### 3.3 Vitral Artwork Pipeline (v0.3.85 – v0.3.87)
- **Folder Manifest:** Owner-curated images placed in `public/prayers/<PRAYER_ID>/` are scanned by `scripts/build-prayer-image-manifest.js` (run automatically on `npm prestart` and `prebuild`) into `src/data/prayerImageManifest.json`.
- **Candidate Chain:** Assignment → Folder images → Mystery maps → `imgmo` → `img` → `imgCandidates` → Thematic → Fallback (`src/utils/prayerImages.js`).
- **Variety Resolvers:** `repeatedPrayerImageVariety.js` ensures repeated prayers (53 Ave Marías in the Rosary, 50 "Por su dolorosa Pasión" in Divine Mercy) cycle through distinct stained glass vitrales rather than looping 2–3 images.
- **Litany Lauretana:** All 100/100 images fully resolve without 404s.

### 3.4 Audio & Voice Architecture
- **Web Audio API (`audioManager.js`):** Singleton AudioContext with user-gesture resume for low-latency procedural bells and chimes.
- **Devotional Voice Autoplay (`usePrayerVoiceAutoplay.js`, `prayerVoicePlayback.js`):** Automatic or on-demand audio guidance in Libro and Rosario.
- **Voice Packs:** Fish TTS Spanish Voz 4 (seed 77) locked standard (`.docs/voice/fish-es-lock.md`). Voice cue sheet in `.docs/voice-cue-sheet.md`.

### 3.5 State & Cloud Synchronization
- **Local:** `localStorage` for rosary date history (`useRosaryStats.js`), active settings, and rose devotion cursors.
- **Stats & Fingerprints (`useAveMariaStats.js`):** Tracks total Ave Marías, level progression (La Semilla → Padre Pío), and rose fingerprints.
- **Cloud Sync (`useCloudSync.js`):** Automatic background syncing to jsonblob.com with 2-second debounce; offline fallback.
- **Art Overrides (`useArtConfigCloudSync.js`):** Synchronizes user verse assignments and image library configurations.

---

## 4. Component Inventory & Status

| Component | File Path | Status | Role |
|-----------|-----------|--------|------|
| `AppShell` | `src/components/Layout/AppShell.jsx` | ✅ Active | Root router, chrome, update banner, modal manager |
| `BookletView` | `src/components/Views/BookletView.jsx` | ✅ Active | Primary devotional reader (Libro) |
| `RosarioVirtualView` | `src/components/Views/RosarioVirtualView.jsx` | ✅ Active | Production physics rosary surface |
| `InteractiveRosary` | `src/components/RosarioNube/InteractiveRosary.jsx` | ✅ Active | Matter.js physics rosary canvas & gesture handler |
| `RoseView` | `src/components/Views/RoseView.jsx` | ✅ Active | Hold-to-charge meditation & rose generator |
| `SacredText` | `src/components/Views/SacredText.jsx` | ✅ Active | Precision-measured sacred text renderer |
| `VerseDrawing` | `src/components/Views/VerseDrawing.jsx` | ✅ Active | Dynamic SVG vector rose renderer |
| `DevotionsShelf` | `src/components/Views/DevotionsShelf.jsx` | ✅ Active | Grid of historic devotions, recorridos and sheets |
| `RecordingStudioView` | `src/components/Views/RecordingStudioView.jsx` | ✅ Active | Voice recording studio and cue sheet monitor |
| `AssetStudio` | `src/components/Views/AssetStudio.jsx` | ✅ Active | Curation, tagging and assignment of vitral artwork |
| `PeregrinacionView` | `src/components/Views/PeregrinacionView.jsx` | ✅ Active | Pilgrimage route visualizer |
| `DailyTracker` | `src/components/Views/DailyTracker.jsx` | ✅ Active | Macetero visualizer and daily goal commitment |
| `MacetonView` | `src/components/Views/MacetonView.jsx` | ✅ Active | Rosary commitments visualizer |
| `JardinDeRosasView` | `src/components/Views/JardinDeRosasView.jsx` | ✅ Active | Garden of prayed roses |
| `ReliquarioView` | `src/components/Views/ReliquarioView.jsx` | ✅ Active | Reliquary view of devotional artifacts |
| `DevotionPlaylistView` | `src/components/Views/DevotionPlaylistView.jsx` | ✅ Active | Continuous playlist queue viewer |

---

## 5. Build, Test & Development Workflows

- **Node / React Stack:** Node 18+, React 19, Create React App (`react-scripts 5.0.1`), `react-router-dom v7`.
- **Start Development:** `npm start` (runs `prestart` scripts to rebuild image manifests, opens on `localhost:3000`).
- **Production Build:** `npm run build` (runs `prebuild` manifest generation and compiles production bundle).
- **Testing:** `npm test -- --watchAll=false --maxWorkers=2` (use `--maxWorkers=2` on Windows to prevent worker OOM).
- **Manifest Updates:** `node scripts/build-prayer-image-manifest.js` and `node scripts/build-image-pools.js`.
