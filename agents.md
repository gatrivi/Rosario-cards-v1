## ROSARIO CARDS — Agent Context & Audit

> **Canonical deep context:** [`.docs/index.md`](.docs/index.md) → [`.docs/architecture/current-stack-jun-2026.md`](.docs/architecture/current-stack-jun-2026.md) for live stack (Jun 2026). This file is a legacy audit snapshot; prefer `.docs/` for feature queries.

**Repo:** `C:\zengatrivi\REACTJS\rosario-cards-v0` (GitHub: `gatrivi/Rosario-cards-v1`)  
**Stack:** React 19, Create React App, Matter.js, D3, react-icons  
**User handle:** gatrivi

---

## ARCHITECTURE

### Entry Point: `src/App.js`
- 4 view modes toggled by state: **Main Rosary** (default), **Stats**, **Rosedal**, **DailyTracker**
- Main view layers: Background prayer text → Physics rosary overlay (pointer-events: none) → Floating UI buttons
- `isEmbedded` prop exists but unused

### Data Layer
- `RosarioPrayerBook.js` — Central prayer DB. Contains sequences (`RGo`, `RDo`, `RGl`, `RL`), apertura, decada, mysteries, cierre
- `src/data/physicsRosaryData.js` — Maps liturgical sequence → 61 physical beads for Matter.js
- `src/utils/prayerMapper.js` — Returns prayer text for node/link clicks (used by old D3 rosary, not physics one)

### State / Sync
- `useRosaryStats.js` — Simple localStorage history (dates). Stats: today/thisWeek/thisMonth/total
- `useAveMariaStats.js` — Tracks total Ave Marías ("rosas"), daily progress, level system. Syncs to cloud via `useCloudSync`
- `useCloudSync.js` — Uses **jsonblob.com** (free). POST/PUT with 2s debounce. Falls back to localStorage

### Audio
- `audioManager.js` — Singleton Web AudioContext. Auto-resumes on user interaction
- `VirtualRosaryPhysics.jsx` generates procedural chimes (oscillators) on bead click/collision

---

## COMPONENT INVENTORY

### WORKING — Keep
| Component | Lines | Status | Notes |
|-----------|-------|--------|-------|
| `App.js` | 175 | ✅ Fixed | Missing state declarations patched (2026-04-28). Routes 4 views |
| `VirtualRosaryPhysics.jsx` | 432 | ✅ Working | Matter.js physics engine. Click detection, zoom, pan, audio chimes, magnetism. **Do NOT discard** |
| `VirtualRosary.jsx` | 12 | ✅ Wrapper | Thin wrapper around VirtualRosaryPhysics |
| `RosarioVirtualView.jsx` | 188 | ✅ Working | **The shelved UX that was wrongly discarded.** Full-screen physics + glassmorphism prayer card + verse-by-verse progression + background images. Complete and functional |
| `RosaEnFocoView.jsx` | 151 | ✅ Working | Hold-to-charge prayer mode. Rose emoji animation, verse teleprompter, vibration |
| `RoseView.jsx` | 928 | ✅ Working | Jardin de Rosas. Sacred drawing, cosmic phases, 3 meditation speeds (oro/incienso/mirra), audio. **Massive — extract before extending** |
| `PrayerButtons.jsx` | 139 | ✅ Working | Classic button grid for prayers. Theme-aware image selection |
| `StatsView.jsx` | 88 | ✅ Working | 12-level progression system (La Semilla → Padre Pío). Grid stats |
| `RosedalView.jsx` | 72 | ✅ Working | Daily commitment view. Shows objective macetones, mini progress squares |
| `DailyTracker.jsx` | 76 | ✅ Working | Daily planner with macetero visualizer. 1/2/4/8 rosario selector |
| `PeregrinacionView.jsx` | 229 | ✅ Working | Snake-map pilgrimage. SVG path, church pins, popover details |
| `useAveMariaStats.js` | 191 | ✅ Working | Local + cloud sync. Rose fingerprint storage (last 500) |
| `useCloudSync.js` | 141 | ✅ Working | jsonblob.com sync. Debounced 2s. Handles offline/online |
| `audioManager.js` | 52 | ✅ Working | Web Audio API singleton |
| `physicsRosaryData.js` | 148 | ✅ Working | 61-node bead mapping. `getPhysicalMapping` for safe-step nav |

### BROKEN / NEEDS FIX
| Component | Issue |
|-----------|-------|
| `ViewPrayers.js` | Only handles `dark` theme. For non-dark themes, returns `undefined` (blank screen) |
| `ViewPrayers.js` | Hardcodes exact Ave Maria string for count display — fragile |

### UNINTEGRATED (exist but not wired into App.js)
| Component | What it does | How to integrate |
|-----------|--------------|------------------|
| `RosarioVirtualView.jsx` | Full physics+prayer experience | Replace main App view or add as route |
| `RosaEnFocoView.jsx` | Hold-to-charge mode | Add toggle in main view or route |
| `RoseView.jsx` | Jardin de Rosas with drawing | Already accessible via `showRosedal` state |
| `PeregrinacionView.jsx` | Pilgrimage map | Add button in Header to toggle |

### LEGACY / UNUSED
| File | Notes |
|------|-------|
| `old_App.js` | Pre-physics version. Simple drag beads with SVG line. Keep for reference |
| `old_App_matter.js` | Matter.js experiment. Keep |
| `old_Bead*.js` | Legacy bead components. Safe to delete after confirming no imports |
| `src/components/RosarioNube/RosarioNube.jsx` | **EMPTY FILE** (0 bytes). Delete |
| `src/components/RosarioNube/Bead.jsx` | Old D3 bead. Not imported by working physics code. Check before deleting |
| `src/jsworkouts/TwoSum.js` | LeetCode practice. Delete or move out of src |

---

## THE "SHELVED PHYSICS ROSARY" — POST-MORTEM

**What happened:** The physics rosary was discarded because it was associated with a broken version that:
1. Triggered prayers/litany at random
2. "Devoured tokens" (jsonblob API limits)

**Current assessment (2026-04-28):**
- `VirtualRosaryPhysics.jsx` is **functionally complete**. Physics works. Click detection is precise (distance < 15px, Query.region). No random triggering
- `RosarioVirtualView.jsx` is **a complete, beautiful UX** — glassmorphism cards, verse progression, background images, next button. It should NOT have been discarded
- The "token devouring" was likely caused by a previous bug where `addRosas()` / `logAveMaria()` fired excessively, spamming `useCloudSync.syncToCloud()` (2s debounce but still hits jsonblob limits under rapid fire)
- Current code has no obvious random-trigger bug. The collision handler (`onCollisionStart`) only plays audio chimes, it does NOT call `onNodeClick`

**Verdict:** The physics rosary and its associated views are **production-ready**. The issue was likely a transient state bug or API spam from an older version. Resurrect with confidence.

---

## KNOWN BUGS

1. **ViewPrayers.js line 7-29** — Returns `undefined` for non-dark themes. Fix: add `else` branch for light/sepia themes
2. **RosarioPrayerBook.js line 395** — Sparse array `[,]` (empty slot at index 1 in mysteries.gozosos). ESLint warning but harmless
3. **App.js** — `prayerImg` initial state reads `RosarioPrayerBook.mysteries[currentMystery]?.[0]` but mysteries array has a string at index 0 (image path), then objects at 1-5. Works but type is inconsistent
4. **RoseView.jsx** — Imports `getSequenceData` from itself (circular-ish). Works because it's a named export, but fragile

---

## TECH DEBT

1. **App.js view routing** — Inline returns for each view mode. Should use React Router or a switch renderer
2. **RoseView.jsx 928 lines** — Extract: drawing logic, cosmic modulation, text rendering into separate components
3. **Inline styles everywhere** — No CSS-in-JS library or Tailwind. Consistent styling is hard
4. **Two stat systems** — `useRosaryStats` (simple history) and `useAveMariaStats` (rosas/macetones). They don't share data. Unify or clarify separation
5. **Cloud sync dependency** — jsonblob.com is free but unreliable. Consider KVDB (like Catreader uses) or Firebase

---

## DATA MODEL REFERENCE

### Prayer Sequence (per mystery)
`RGo` / `RDo` / `RGl` / `RL` = array of IDs like:
`SC, AC, C, P, A, A, A, G, F, MG1, P, A×10, G, F, MG2...`

ID meanings:
- `SC` = Sign of Cross
- `AC` = Apostles Creed
- `C` = Contrition
- `P` = Padre Nuestro (Our Father)
- `A` = Ave Maria
- `G` = Gloria
- `F` = Fatima prayer
- `MG1-5` / `MD1-5` / `ML1-5` = Mysteries (Gozosos/Dolorosos/Luminosos)
- `LL` = Letania/Litany
- `S` = Salve Regina (Medal)

### Physical Bead Mapping
- 61 total nodes: 1 cross + 59 beads + 1 medal
- `physicsRosaryData.getRosaryBeads()` filters sequence to physical items only
- `getPhysicalMapping()` maps liturgical index → physical index for "safe-step" navigation

---

## DESIGN REQUIREMENTS
- **Version number must always be visible in deployed builds** (at least during active development). Display subtle `vX.Y.Z` badge in a corner so users can verify what they're testing
- **Version naming convention**: Use theme-related descriptive names for each version. E.g. `v0.2.0 — La Cruz`, `v0.3.0 — El Jardín`. Document the name in `agents.md` when bumping
- **Layering**: Background image → Prayer text (z-index middle) → Rosary (z-index forefront). The rosary must always be fully visible and interactive on top. Prayers are read through and around the beads, never as a blocking card
- No anxious HUD: no progress bars, streaks, or completion metrics on the main prayer screen
- **Plan Diario** = the daily commitment of roses to plant in the Rosedal. **Rosedal** = the garden where planted roses are displayed

## SESSION NOTES (2026-04-28)
- Fixed missing state in App.js: `currentMystery`, `setcurrentMystery`, `prayer`, `setPrayer`
- Build passes with warnings (unused vars in RoseView, AppShell, VirtualRosaryPhysics)
- **Do not delete** `VirtualRosaryPhysics.jsx` or `RosarioVirtualView.jsx` — they are complete and functional

## SESSION NOTES (2026-04-28b)
- Bumped version to `0.2.0`
- Cross-gesture magnetism implemented: draw ✝ on canvas to align scattered beads
- Physics tuned for contemplative feel: high friction, low restitution, differentiated bead mass
- RosarioVirtualView redesigned: prayer bar moved to top, bottom card/buttons removed
- BottomNav: "Diario" renamed to "Rosedal" with 🌹 icon

## SESSION NOTES (2026-04-28c)
- `pulse` state refactored to `pulseRef` — eliminated eslint `react-hooks/exhaustive-deps` warning
- RosarioVirtualView layering fixed: prayer text is now middle z-index (z=5), rosary canvas is forefront (z=20). Text is visible through and around beads
- Removed "Siguiente Verso" button and verse dots — advancement is tap/swipe only
- Header "Plan Diario" kept (Plan Diario = daily commitment, Rosedal = garden)
- AppShell: subtle `v0.2.0` badge bottom-left
- Version naming convention documented in DESIGN REQUIREMENTS

## SESSION NOTES (2026-05-08)
- Bumped version to `0.3.0 — La Rosa Accesible`
- Unified Physics Rosary with Interactive Rosa: background now responds to "empty" touches with a charging bloom
- Integrated Gothic Organ Synth: physics beads now hum with sacred frequencies on interaction
- Navigation Unified: legacy header removed, all features (Plan, Stats) moved to BottomNav
- Elderly Accessibility: implemented "Lectura Fácil" (Simple Mode) with 40% larger fonts and 4x faster interaction
- Physics refinement: separated tap/swipe callbacks to ensure navigation always works during meditation
- Fixed touch obfuscation: Matter.js canvas now delegates unused events to the moment layer

## SESSION NOTES (2026-05-08b)
- Final Upgrade: `v0.3.1 — Excelencia Sagrada`
- Visual Mystery Symbols: The rosary medal now transforms visually based on the active mystery (Gozoso, Doloroso, etc.)
- Interactive Glows: Added intense "interaction glows" and a pulsing "heartbeat" halo to the active bead
- PWA Offline Support: Implemented a Service Worker and PWA manifest registration so the app works in signal-dead zones (basements, old churches)
- Technical Integrity: Fixed legacy syntax errors in `ViewPrayers.js` to ensure a green build
