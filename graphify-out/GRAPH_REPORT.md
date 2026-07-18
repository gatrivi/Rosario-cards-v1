# Graph Report - .  (2026-07-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 955 nodes · 2162 edges · 80 communities (56 shown, 24 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 65
- Community 66
- Community 67
- Community 74
- Community 75
- Community 76

## God Nodes (most connected - your core abstractions)
1. `BookletView()` - 49 edges
2. `buildSequence()` - 32 edges
3. `RosarioVirtualView()` - 25 edges
4. `AppShell()` - 24 edges
5. `useAveMariaStats()` - 21 edges
6. `imagePath()` - 20 edges
7. `AssetStudio()` - 16 edges
8. `compilerOptions` - 15 edges
9. `SoundEffects` - 15 edges
10. `InteractiveRosary()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `RosaryCanvas()` --indirect_call--> `beadOptions()`  [INFERRED]
  rosario-virtual-ph-eng-mech/src/components/RosaryCanvas.tsx → src/components/RosarioNube/physics-stable/createBeads.js
- `getSequenceData()` --indirect_call--> `formatLitanyLine()`  [INFERRED]
  src/components/Views/RoseView.jsx → src/utils/litanyHelpers.js
- `getSagradoCorazonAdoracionSequence()` --indirect_call--> `step()`  [INFERRED]
  src/data/sagradoCorazonAdoracionData.js → src/data/marianDevotionsData.js
- `App()` --calls--> `getDefaultMystery()`  [EXTRACTED]
  src/App.js → src/components/utils/getDefaultMystery.jsx
- `expectValidSequence()` --calls--> `buildSequence()`  [EXTRACTED]
  src/__tests__/devotionsShelfFlow.test.js → src/utils/bookletSequence.js

## Import Cycles
- None detected.

## Communities (80 total, 24 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (80): OfferingLight(), PrayerShareCard, PrayerSharePreviewModal(), VitralBackground(), LitanyDisplay(), LitanyEntrance(), LitanyProgressBars(), AssignmentMapper() (+72 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (55): PrayerRecorder(), voiceControlIcon(), voiceControlLabel(), BookletOutlineView(), RecordingStudioView(), BUNDLED_VOICE_BY_ID, listBundledVoiceKeys(), resolveBundledVoiceClip() (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (57): AssetCard(), AssetStudio(), btnStyle(), inputStyle, portableBtnStyle, btnStyle, chipStyle(), ClassifyImagesPanel() (+49 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (29): CosmicResonator, isProbablyMobile(), SacredDust(), VERSOS_AVE_MARIA, debug(), getPrayerData(), getSequenceData(), RoseView() (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (36): CompromisoShareCard, CompromisoSheet(), useBeadInteraction(), useRosaryDragging(), useRosaryPosition(), useRosarySequence(), useRosaryState(), debug() (+28 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (31): RosaryCanvas(), RosaryCanvasProps, BeadData, getRosaryBeads(), initialBeads, PRAYERS, beadOptions(), createBeads() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (31): OrbPhotoCrop(), orbPhotoTransform(), defaultIntentionLabel(), IntentionOrb(), OrbImage(), PrayForOrbs(), PRAY_FOR_PRESETS, AudioManager (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (14): TutorialOverlay(), InteractiveAveMaria(), quickBtnStyle, VERSOS_AVE_MARIA, RosedalView(), JardinDeRosasView(), MonkView(), PeregrinacionView() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (11): FeedbackOverlay(), ReleaseNotesOverlay(), SyncManager(), getReleaseNotes(), getUpdateSummaryLine(), RELEASE_NOTES, useCloudSync(), applyPendingUpdate() (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (4): IconHandLeft(), IconHandRight(), IconHelp(), IconSettings()

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (17): dotenv, express, @google/genai, lucide-react, dependencies, dotenv, express, @google/genai (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (14): OptionalPrayerSheet(), angelImg, benedictImg, benedictLatinImg, carmenCandidates, carmenImg, carmenImgAlt, carmenImgAlt2 (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, tailwindcss, tsx, @types/express, @types/matter-js, @types/node (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (15): d3, dependencies, d3, matter-js, react, react-dom, react-router-dom, @testing-library/dom (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (12): divineMercyPrayers, EF_DECADE_IMAGES, faustinaVitral, HG_TRIPLET_IMAGES, holyGodRunAt(), MERCY_DECADES, MERCY_OPENING_IMAGES, mercyDecadeAt() (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.31
Nodes (7): DevotionsShelf(), ShelfItem(), FaustinaMercyThumb(), MercyWindowThumb(), StationsDevotionThumb(), faustinaThumb, devLog()

### Community 18 - "Community 18"
Cohesion: 0.23
Nodes (9): BottomNav(), emitBookletStep(), MAS_ACTIVE, MAS_DESTINATIONS, NAV_ICONS, getPathForView(), getViewIdFromPath(), VALID_PATHS (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (11): jest, moduleNameMapper, ^react-router-dom$, name, private, scripts, build, eject (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (10): PRECIOUS_BLOOD_CHAPLET_KEYS, preciousBloodChapletPrayers, preciousBloodLitanyMeta, preciousBloodLitanySections, preciousBloodLitanyVerses, preciousBloodSevenOfferings, preciousBloodSevenSheddings, isPreciousBloodMode() (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (4): ErrorBoundary, root, reportWebVitals(), subscribeToAppUpdates()

### Community 23 - "Community 23"
Cohesion: 0.24
Nodes (10): getSagradoCorazonAdoracionSequence(), IMAGE_HINT_POOL, IMAGE_POOLS, LITANY_INVOCATIONS, resolveStepImages(), sacredHeartLitanySections, sacredHeartLitanyVerses, sagradoCorazonAdoracionThumbnail (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): book, { execSync }, fs, ll, path, root, src, tmp (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (5): App(), DAY_NAMES, NunPlanView(), NunSilhouette(), getDefaultMystery()

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (9): browserslist, development, production, >0.2%, last 1 chrome version, last 1 firefox version, last 1 safari version, not dead (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.28
Nodes (8): AppShell(), SAGRADO_CORAZON_ADORACION_STEPS, BOOKLET_MYSTERIES, isValidBookletMystery(), isValidRosaryMystery(), resolveRosaryMystery(), ROSARY_MYSTERIES, ROSARY_MYSTERY_IDS

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (8): getPrayerVariants(), expectValidSequence(), SHELF_DEVOTION_IDS, buildPreciousBloodSequence(), buildSequence(), getBookletPrayerData(), getSequenceKeys(), isMarianDevotionMode()

### Community 29 - "Community 29"
Cohesion: 0.31
Nodes (8): buildStationSteps(), buildViaCrucisSequence(), buildViaLucisSequence(), cycle(), DOLOR, LUZ, VIA_CRUCIS_STATIONS, VIA_LUCIS_STATIONS

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 32 - "Community 32"
Cohesion: 0.36
Nodes (6): MacetonView(), COLORS, PATH_TYPES, petalColor(), ROSE_PATHS, RoseDrawing()

### Community 33 - "Community 33"
Cohesion: 0.32
Nodes (6): angelusSequence, buildMarianDevotionSequence(), isMarianDevotionMode(), magnificatSequence, magnificatThumbnail, MARIAN_DEVOTION_IDS

### Community 34 - "Community 34"
Cohesion: 0.52
Nodes (6): Path, is_latin(), main(), mean_luma(), Batch luminance gate for modooscuro backgrounds.  Keep mean Rec.601 luma < thres, scan()

### Community 36 - "Community 36"
Cohesion: 0.48
Nodes (5): FOCUSABLE_SELECTOR, getFocusableElements(), isElementVisible(), MobileElementStepper(), useMobileStepperVisible()

### Community 37 - "Community 37"
Cohesion: 0.52
Nodes (5): HISTORIC_DEVOTIONS, historicDevotionThumb(), upcomingDevotionThumbs(), imagePath(), bloodImg()

### Community 38 - "Community 38"
Cohesion: 0.62
Nodes (6): advanceCompletedNovenaDay(), installNovenaAutoProgress(), isNovenaActive(), markIfNovenaComplete(), readInt(), todayKey()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 40 - "Community 40"
Cohesion: 0.53
Nodes (4): readRosaryZoom(), ROSARY_ZOOM_PRESETS, setRosaryZoom(), SettingsOverlay()

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 42 - "Community 42"
Cohesion: 0.70
Nodes (3): LEVELS, StatsView(), useRosaryStats()

### Community 43 - "Community 43"
Cohesion: 0.50
Nodes (4): eslintConfig, extends, react-app, react-app/jest

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (3): fake-indexeddb, devDependencies, fake-indexeddb

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (3): vite, vite, vite

## Knowledge Gaps
- **180 isolated node(s):** `RosarioDS`, `short_name`, `name`, `icons`, `start_url` (+175 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RosarioPrayerBook` connect `Community 5` to `Community 0`, `Community 3`, `Community 4`, `Community 20`, `Community 25`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `buildSequence()` connect `Community 28` to `Community 0`, `Community 1`, `Community 33`, `Community 4`, `Community 9`, `Community 16`, `Community 20`, `Community 23`, `Community 27`, `Community 29`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `RosarioDS`, `short_name`, `name` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.052743652743652746 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06869446343130553 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08944099378881988 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06801346801346801 - nodes in this community are weakly interconnected._