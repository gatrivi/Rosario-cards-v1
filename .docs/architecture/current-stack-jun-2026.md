# Current stack — Jun 2026

**Version:** v0.3.35 — El Cosmos Resonante  
**Branch:** `cloud-rosary-v2`  
**Entry:** `src/index.js` → `App.js` → `AppShell.jsx`

## View routing (`AppShell`)

| View key | Component | Purpose |
|----------|-----------|---------|
| `booklet` | `BookletView` | Libro — vitral prayer booklet, litany per-verse |
| `rosario` | `RosarioVirtualView` | Physics rosary + prayer layer |
| `roosedal` | `RoseView` / garden | Planted roses |
| `stats` | `StatsView` | Progression grid |
| `plan` | `RosedalView` / `DailyTracker` | Daily commitment |

Default main experience: **Booklet** and **Rosario** (BottomNav).

## Rosary path (production)

```
RosarioVirtualView
  → RosaryAdapter
  → InteractiveRosary (Matter.js + MouseConstraint)
  → soundEffects.js (event chimes, lazy init)
```

Archived: `physics-stable/`, `VirtualRosaryPhysics.stable.jsx`

## Litany (LL)

| Piece | Path |
|-------|------|
| Verse data | `src/data/litanyLauretana.js` → `RosarioPrayerBook.cierre` |
| Helpers | `src/utils/litanyHelpers.js` |
| Images | `src/utils/prayerImages.js` (`imgmo` first) |
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

## State / sync

| Hook | Storage |
|------|---------|
| `useRosaryStats.js` | localStorage dates |
| `useAveMariaStats.js` | Rosas, macetones, levels |
| `useCloudSync.js` | jsonblob.com, 2s debounce |

## Audio

| Module | Status |
|--------|--------|
| `audioManager.js` | Singleton Web AudioContext, resume on tap |
| `soundEffects.js` | Rosary chimes, collision, chain prayers — **wired** |
| `CosmicResonator.js` | Gothic organ — **orphaned**, future opt-in |
| `bookletSounds.js` | Booklet transition chimes |

Settings: `localStorage.rosario_sound_enabled` via `AppShell` / `SettingsOverlay`.

## Component inventory

### Working — keep

| Component | Notes |
|-----------|-------|
| `AppShell.jsx` | View router, settings, version badge |
| `BookletView.jsx` | Libro + litany integration |
| `RosarioVirtualView.jsx` | Layered prayer + rosary |
| `RosaryAdapter` + `InteractiveRosary` | Production physics rosary |
| `RoseView.jsx` | Jardín — large, extract before extending |
| `VirtualRosaryPhysics.stable.jsx` + `physics-stable/` | Archive reference |
| `useAveMariaStats`, `useCloudSync` | Stats + cloud |

### Broken / needs fix

| Component | Issue |
|-----------|-------|
| `ViewPrayers.js` | Non-dark themes return undefined |

### Legacy / unused

| File | Notes |
|------|-------|
| `old_App.js`, `old_App_matter.js` | Reference only |
| `useD3Rosary.js` | Pre-Matter D3 rosary |
| Empty `RosarioNube.jsx` | Safe to delete when confirmed |

## Layering (Rosario view)

| z-index | Layer |
|---------|-------|
| 5 | Prayer text / RosaEnFoco / litany UI |
| 20 | Matter canvas (transparent bg) |
| 25+ | Floating chrome (mode toggle, version) |

## Related

- [rosary-ux-recovery-jun-2026.md](../virtual-rosary/rosary-ux-recovery-jun-2026.md)
- [live-system-snapshot.md](./live-system-snapshot.md) — pre-recovery monolith detail (partially stale)
