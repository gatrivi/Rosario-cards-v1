# Handoff 2026-10-25 — Descriptores Sagrados y Riqueza Visual

> **Context:** Local audit, renaming, and quantification of the image catalog expansion and visual anti-repetition engine.  
> **Status:** 60/60 test suites passing, 411/411 tests green. All referenced images verified NFC on disk.

---

## 1. Executive Summary

Historically, the prayer app struggled with intense visual repetition: praying the 53 Ave Marías of a Rosary rotated through just 3–4 pictures (with every fourth hit landing on a missing fallback image), while the 50 steps of *"Por su dolorosa Pasión"* in the Divine Mercy chaplet repeated a fixed set of 5 images. Furthermore, over 300 sacred art images sat in asset directories under cryptic hash names (`06d6d80991cbdbac9d5666f980f3e93f.jpg`), Twitter IDs (`HOTthgTWEAAHsZG.jpg`), or random tokens (`0DkakeTb.jpg`, `CSk9qSlq.jpg`), making it nearly impossible to pair art with prayers.

This milestone achieves two critical goals:
1. **Systematic Renaming:** Audited and renamed ~320 image files across `src/data/assets/img/` and `public/gallery-images/` to clean, descriptive Spanish/Latin devotional titles based on visual reviews, updating the registry, imports, and review database without broken paths.
2. **Quantified Anti-Repetition Engine:** Formalized and documented the metrics proving that our image library is now **+1,000% to +7,600% richer**, completely eliminating repeats during a 53-bead Rosary (100% unique art per session).

---

## 2. Visual Richness & Anti-Repetition Metrics

### A. In-Session Variety (The Praying Experience)

Measured through the live sequence and rotation pipeline (`src/__tests__/repeatedPrayerImageVariety.test.js`):

| Devotional Surface | Previous Variety | Current Variety | Variety Increase (%) | Repetition Rate During Session |
| :--- | :---: | :---: | :---: | :---: |
| **Ave María** *(53 beads in a 5-decade Rosary)* | 3–4 distinct images | **53 distinct images** | **+1,225% to +1,667%** | **0% repeats** *(was repeating every 3–4 beads)* |
| **Divina Misericordia** *(50 beads of "Por su dolorosa Pasión")* | 5 distinct images *(1/decade)* | **49 distinct images** | **+880%** | **2% repeats** *(was repeating 10× per decade)* |
| **Letanía Lauretana** *(60 distinct verses)* | 32 verses broken/reused | **60 unique vitrales** | **+87.5%** | **0% repeats** *(100% 1-to-1 verse art)* |

### B. Catalog & Candidate Pool Depth

| Image Pool / Scope | Previous Active Size | Current Active Pool | Depth Increase (%) | Notes |
| :--- | :---: | :---: | :---: | :---: |
| **Mary Pool (`ave/`)** | 3 usable candidates | **233 curated images** | **+7,666%** | Fed into `A` rotation |
| **Passion Pool (`passion/`)** | 5 static decade plates | **63 curated images** | **+1,160%** | Fed into `MP`, `DMO1/2`, `MD1-5` |
| **Generated Catalog (`imageLibraryCatalog.json`)** | ~25 static entries | **296 active entries** | **+1,084%** | Shipped offline floor |
| **Total Active Sacred Art (Catalog + Core Registry)** | ~30 images | **~366 unique images** | **+1,120%** | All verified NFC on disk |

### C. Elimination of Ghost Repetition & Fallback Contamination
- **Fallback Exclusion:** `FALLBACK_IMAGE` (`cathedral praing.jpg`) previously sat in the rotation candidates array. As a result, 50% of Our Father (`P`), Glory (`G`), and Fatima (`F`) prayers showed the generic cathedral rather than dedicated art. Fallbacks are now excluded from rotation and used exclusively on network/image load error.
- **Thematic Isolation:** `WRONG_SUBJECT.passion` strictly excludes Marian titles from Christological prayers, preventing Marian plates from appearing behind Christ's Passion.

---

## 3. Renaming Audit & Architecture

All images were renamed from cryptic tokens to descriptive titles matching their iconography:

### Stage 1: Curated Primary Assets (41 images)
- **Mary (`src/data/assets/img/mary/`):**
  - `HOTthgTWEAAHsZG.jpg` → `bouguereau-reina-de-los-angeles.jpg`
  - `jpg.jpg` → `virgen-de-las-rosas-nino-jesus.jpg`
  - `sain.jpg` → `presentacion-virgen-maria-templo.jpg`
  - `1305417936_1.jpg` → `virgen-con-nino-y-angeles-flores.jpg`
  - `24004.jpg` → `virgen-de-lourdes-bernadette.jpg`
- **Monks & Nuns (`src/data/assets/img/monk/`, `nuns/`):**
  - `151.jpg` → `caballeros-templarios-cruzados.jpg`
  - `8a7db322...` → `santa-teresa-de-avila-doctora.jpg`
  - `bb66c245...` → `santa-teresita-lecho-crucifijo.png`
  - `1.png` → `dama-oracion-altar-iglesia.png`
  - `3.jpg` → `escultura-dama-orante-velo-encaje.jpg`
  - `5.jpg` → `mujeres-rezando-santo-rosario.jpg`
- **Mysteries & Devotions (`public/gallery-images/`):**
  - `misterios/gloria/06d6d809...` → `pentecostes-espiritu-santo-apostoles.jpg`
  - `misterios/gloria/0bdd9678...` → `asuncion-de-la-virgen-maria.jpg`
  - `misterios/gloria/aa467f24...` → `resurreccion-del-senor-sepulcro.jpg`
  - `misterios/modoclaro/15ec4601...` → `san-jose-carpintero-nino-jesus.jpg`
  - `adoracion/6051780745909814.jpg` → `elevacion-santismo-sacramento-misa.jpg`

### Stage 2: Litany Vitrales (32 images in `public/gallery-images/litany/modooscuro/`)
- Renamed Twitter slugs (`27oUSDfh.jpg`, `CSk9qSlq.jpg`, `PkFe60PV.jpg`, `0DkakeTb.jpg`, etc.) to:
  - `vitral-santa-teresa-de-avila.jpg`
  - `vitral-la-anunciacion.jpg`
  - `vitral-san-jose-obrero.jpg`
  - `vitral-virgen-maria-litania.jpg`
  - `vitral-sagrada-familia.jpg`
  - *etc.*

### Stage 3: Sacred Art Bulk Renaming (246 images in `Arte-Sacro/`)
- Renamed all hash and slug files in `classic-orthodox/`, `medieval-renaissance/`, `stained-glass/`, `DarkMode/`, and root according to their reviewed subjects:
  - E.g., `icono-crucifixion-calvario-san-juan.jpg`, `claroscuro-crucifixion-calvario-crowd.jpg`, `grabado-crucifixion-calvario-dore.jpg`, `pintura-virgen-maria-star-of-the-sea.jpg`.
- Ensured distinct normalized stems (`replace(/[^a-z0-9]+/g, '')`) to avoid deduplication collisions in `build-image-pools.js`.

---

## 4. Database & Sync Pipeline

```
Curated Art Files (NFC on disk)
       │
       ▼
scripts/image-visual-review.json  ──▶  scripts/build-image-pools.js
       │                                            │
       ▼                                            ▼
src/data/imageRegistry.js          src/data/imageLibraryCatalog.json (296 entries)
       │                                            │
       └──────────────────┬─────────────────────────┘
                          ▼
               src/utils/prayerImages.js
           (occurrenceIndexAt rotation)
                          │
                          ▼
            VitralBackground / UI Screens
```

- **`image-visual-review.json`:** Stores styles (`classic`, `stained-glass`, `icon`, etc.) and liturgical subjects for 100% of the images in the repo. All 300+ renamed paths were updated in this file.
- **`build-image-pools.js`:** Executed on `npm run prestart` and `prebuild`. Compiles `imageLibraryCatalog.json` and synchronizes `public/gallery-images/ave/` and `passion/`, pruning orphan files.
- **`imageRegistry.js`:** Updated all ES6 imports and metadata tags to match new descriptive filenames.

---

## 5. Automated Verification & Invariants

1. **`imagePathsOnDisk.test.js`:**
   - Verifies that every single image referenced in registries, sequences, folders, and catalogs exists on disk.
   - Enforces NFC Unicode normalization to prevent production server 404s.
2. **`imageLibraryCatalog.test.js`:**
   - Asserts exact catalog counts (233 Mary + 63 Passion = 296 total).
   - Enforces strict subject isolation: no Marian images in the Passion pool.
3. **`repeatedPrayerImageVariety.test.js`:**
   - Validates that the 53 Ave Marías in every rosary mystery resolve to 53 distinct images.
   - Validates that the 50 Passion steps resolve to 49 distinct images.
4. **Full Test Suite:**
   - `60/60 test suites passing, 411/411 tests green.`
