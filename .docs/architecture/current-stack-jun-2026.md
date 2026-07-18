# Current stack — Jun 2026 (updated Jul 2026)

**Live (prod):** https://rosario.gatrivi.com (Vercel custom domain; previews may still be `*.vercel.app`)  
**Version:** see `AppShell.jsx` `APP_VERSION` + `src/data/releaseNotes.js`  
**Entry:** `src/index.js` → `App.js` → `AppShell.jsx` (react-router v7)

## View routing (`src/navigation/routes.js` → `AppShell`)

| View key | Path | Component | Nav |
|----------|------|-----------|-----|
| `booklet` | `/libro`, `/` | `BookletView` | BottomNav |
| `rosary` | `/rosario` | `RosarioVirtualView` | BottomNav |
| `rose` | `/rosa` | `RoseView` | BottomNav |
| `voz` | `/voz` | `RecordingStudioView` | BottomNav |
| `tracker` | `/plan` | `DailyTracker` | BottomNav |
| `camino` | `/camino` | `PeregrinacionView` | BottomNav |
| `macetones` | `/macetones` | `MacetonView` | via Camino / settings |
| `jardin` | `/jardin` | `JardinDeRosasView` | via Macetones |
| `monk` | `/monk` | `MonkView` | hidden / dev |
| `assets` | `/assets` | `AssetStudio` | Ajustes → Estudio de imágenes |

**BottomNav on Libro:** only Libro · Rosa · Voz (clean prayer panel).  
**Ajustes** (top-right, not a gear): settings, Novedades, Estudio. **Sync** adjacent.

## Libro devotions (header vitrales + URL)

Classic mysteries: `?misterio=gozosos|dolorosos|gloriosos|luminosos`  
Faustina: Corona / Novena (`?dia=` for novena day)  
Estaciones: Vía Crucis / Vía Lucis (`?misterio=viacrucis|vialucis`)  
Oraciones breves: `?oracion=expedito|michael|guardian|benedict|carmen`  
Sangre Preciosa, Ofrendas — see `BookletView` + `session-report-2026-07-03-night.md`  
Share / deep-link base: **`https://rosario.gatrivi.com`** (also hardcoded in `compromisoStore.js`, `SettingsOverlay.jsx`)

## Rosary path (production)

```
RosarioVirtualView
  → RosaryAdapter
  → InteractiveRosary (Matter.js + MouseConstraint)
  → soundEffects.js (event chimes, lazy init)
```

Archived reference: `physics-stable/`, `VirtualRosaryPhysics.stable.jsx`

## Litany (LL)

| Piece | Path |
|-------|------|
| Verse data | `src/data/litanyLauretana.js` → `RosarioPrayerBook.cierre` |
| Helpers | `src/utils/litanyHelpers.js` |
| Images | `src/utils/prayerImages.js`, `imageRegistry.js`, Estudio assignments |
| UI | `src/components/Litany/*` |
| Booklet | `BookletView` — `litanyVerseIndex`, per-verse vitral |
| Rosario | `getSequenceData()` — `verseImages[]` on LL |

## Data layer

| File | Role |
|------|------|
| `RosarioPrayerBook.js` | Prayers, sequences `RGo`/`RDo`/`RGl`/`RL`, mysteries |
| `physicsRosaryData.js` | 61 physical beads, `getPhysicalMapping()` |
| `rosaryTopology.js` | `buildRosaryEdges()` — v4 constraint graph |
| `litanyLauretana.js` | Structured LL verses + sections |
| `viaCrucisData.js` | Vía Crucis / Vía Lucis stations |
| `imageRegistry.js` | Bundled art ids; overrides via Estudio |

## State / sync

| Hook / module | Storage |
|---------------|---------|
| `useRosaryStats.js` | localStorage dates |
| `useAveMariaStats.js` | Rosas, macetones, levels |
| `useCloudSync.js` | jsonblob.com, 2s debounce |
| `useArtConfigCloudSync.js` | `artConfig` in same jsonblob payload |
| `artConfigSync.js` | Registry overrides + verse assignments merge |

## Firebase (optional, lazy)

| Module | Role |
|--------|------|
| `src/config/firebase.js` | Active only if `REACT_APP_FIREBASE_*` in `.env.local` |
| `firebaseArtConfig.js` | `shared/artConfig` read/write |
| `firebaseImageLibrary.js` | `shared/imageLibrary` + Storage uploads |

**Blocked until console:** Firestore + Storage rules (permission denied in Estudio). See `releaseNotes.js` UPCOMING.

## Audio / voice

| Module | Status |
|--------|--------|
| `audioManager.js` | Singleton Web AudioContext, resume on tap |
| `soundEffects.js` | Rosary chimes — **wired** |
| `bookletSounds.js` | Booklet transition chimes |
| `usePrayerVoiceAutoplay` + `pickRecordingForSlot` | Libro + Rosario virtual — **wired** |
| `CosmicResonator.js` | Gothic organ — **orphaned**, future opt-in |

Settings: `localStorage.rosario_sound_enabled` via `AppShell` / `SettingsOverlay`.

## Component inventory

### Working — keep

| Component | Notes |
|-----------|-------|
| `AppShell.jsx` | Router, PWA update banner, version badge, Ajustes |
| `BookletView.jsx` | Libro + litany + devotions |
| `RosarioVirtualView.jsx` | Layered prayer + rosary (⚠ stale hardcoded `v0.3.40` chrome badge — use AppShell badge) |
| `RosaryAdapter` + `InteractiveRosary` | Production physics rosary |
| `AssetStudio.jsx` | Registro / Clasificar / Asignar versos |
| `RoseView.jsx` | Jardín — large, extract before extending |
| `useAveMariaStats`, `useCloudSync`, `useArtConfigCloudSync` | Stats + cloud + art |

### Legacy / unused (not production bugs)

| File | Notes |
|------|-------|
| `ViewPrayers.js` | Not mounted by `AppShell`; dark forced — moot |
| `old_App.js`, `old_App_matter.js` | Reference only |
| `useD3Rosary.js` | Pre-Matter D3 rosary |
| `VirtualRosaryPhysics.stable.jsx` | Archive reference |

## Layering (Rosario view)

| z-index | Layer |
|---------|-------|
| 5 | Prayer text / RosaEnFoco / litany UI |
| 20 | Matter canvas (transparent bg) |
| 25+ | Floating chrome |

## Shipped vs next

Source of truth: `src/data/releaseNotes.js` (`CURRENT` / `UPCOMING`).  
Ranked backlog: [future-features.md](../roadmap/future-features.md).  
Open bugs (verified): [known-issues.md](../litany/known-issues.md).

## Related

- [rosary-ux-recovery-jun-2026.md](../virtual-rosary/rosary-ux-recovery-jun-2026.md)
- [session-report-2026-07-03-night.md](../dev-notes/session-report-2026-07-03-night.md)
- [live-system-snapshot.md](./live-system-snapshot.md) — **historical** pre-recovery detail
