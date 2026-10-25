# Historic Christian devotions (Libro shelf)

**v0.3.88** (Consolidated) · Source of truth: `src/data/historicDevotionsCatalog.js`  
UI: Libro → Devociones (`DevotionsShelf`) · rows **Devociones** / **Oraciones breves** / **Próximas**  
Handoff reference: [.docs/handoff-2026-09-26-el-estante.md](../handoff-2026-09-26-el-estante.md)

Prefer **modooscuro / stained-glass** thumbs (`imageRegistry` ids).

## Surface Architecture (v0.3.86+)

The catalog uses explicit surfaces rather than a vague boolean `status`:

| `surface` | Meaning | App Location |
|-----------|---------|--------------|
| `vias` | The four classic rosary mysteries (Gozosos, Dolorosos, Gloriosos, Luminosos) | Main Rosary navigation |
| `recorrido` | A full Libro sequence (`targetId` in `BOOKLET_MYSTERY_IDS`) | Recorridos row on Devotions shelf |
| `breve` | An optional prayer sheet entry (`targetId` in `OPTIONAL_PRAYERS`) | Oraciones breves row |
| `embedded` | Folded into another surface (e.g. adoration or rosary closing) | Embedded within parent view |
| `soon` | Planned / not yet available (`targetId: null`), shown in greyscale | Próximas row |

Every `targetId` is verified in automated CI tests (`src/__tests__/historicDevotionsCatalog.test.js`) to ensure registries never drift.

---

## Month & Season Calendar (Popular Piety)

| When | Traditional focus | Special prayers / practice | App status |
|------|-------------------|----------------------------|------------|
| **Jan** | Holy Name / Childhood of Jesus | Litany of the Holy Name; Infant Jesus | — |
| **Feb** | Holy Family / Purification | Presentation; Holy Family prayers | — |
| **Mar** | St Joseph · Passion | St Joseph (19); Via Crucis (Lent) | Joseph **próx.** (waiting on art) · Via Crucis **have** |
| **Apr** | Eucharist · Resurrection · Holy Spirit | Adoration; Via Lucis (Easter); Pentecost novena | SC/Eucharist **have** · Via Lucis **have** · Espíritu Santo **have** (v0.3.86) |
| **May** | Blessed Virgin Mary | Rosary; Loreto; May crowning; Ángelus | Rosario / Loreto / Ángelus / Magnificat / Memorare **have** |
| **Jun** | Sacred Heart | Litany SC; First Fridays; consecration | Sagrado Corazón **have** |
| **Jul** | Precious Blood | Litany / corona / 7 ofrendas | Sangre (3 modes) **have** · `PRECIOUS_BLOOD_MONTH = 6` |
| **Aug** | Immaculate Heart · Assumption | Consecration to Inmaculado Corazón; Assumption (15) | Inmaculado Corazón **have** (v0.3.86) |
| **Sep** | Seven Sorrows · Holy Cross | Dolores (15); Exaltation of the Cross (14) | Via Crucis covers Passion |
| **Oct** | Holy Rosary · Holy Angels | Daily Rosary; Our Lady of the Rosary (7); St Michael | Rosario **have** · San Miguel **have** · Ángel Guarda **have** |
| **Nov** | Holy Souls | All Saints (1); All Souls (2); office for dead | — (planned) |
| **Dec** | Immaculate Conception · Nativity | IC (8); Advent; Nativity; Memorare | Memorare **have** · IC art via Mater Immaculata |

### Movable / Dated

| Window | Prayer / devotion | App status |
|--------|-------------------|------------|
| Good Friday → Divine Mercy Sunday | **Novena de la Divina Misericordia** (9 days) | **have** (`divinamisericordia_novena`) |
| Anytime | **Coronilla de la Divina Misericordia** | **have** (Libro + Rosa `/rosa?devocion=misericordia`, v0.3.88) |
| Eastertide | Via Lucis | **have** |
| Lent | Via Crucis | **have** |
| First Fridays | Sacred Heart | **have** (`sagrado_corazon_adoracion`) |
| First Saturdays | Immaculate Heart / Fatima | **have** (`inmaculado_corazon`) |
| Sep 29 | St Michael (feast) | **have** (`michael` breve) |
| Oct 2 | Holy Guardian Angels | **have** (`guardian` breve) |

---

## Devotions Catalog (Current Implementation)

| Id | Label | Surface | Target ID | Note | Art (`imgId`) | Status |
|----|-------|---------|-----------|------|---------------|--------|
| `rosary` | Rosario | `vias` | — | s. XIII–XV · popularísimo | `magnificatVisitation` | **have** |
| `stations` | Vía Crucis | `recorrido` | `viacrucis` | estaciones · pasión | `vitreauxCruz` | **have** |
| `eucharist` | Eucaristía | `embedded` | `sagrado_corazon_adoracion` | adoración / Corpus | `gallerySagradoCorazon` | **have** |
| `sacred_heart` | Sagrado Corazón | `recorrido` | `sagrado_corazon_adoracion` | s. XVII · Alacoque | `gallerySagradoCorazon` | **have** |
| `angelus` | Ángelus | `recorrido` | `angelus` | oración del día | `allMary17th` | **have** |
| `divine_mercy` | Divina Misericordia | `recorrido` | `divinamisericordia` | Faustina · s. XX (Libro + Rosa) | `faustinaStainedGlass` | **have** |
| `precious_blood` | Preciosísima Sangre | `recorrido` | `sangrepreciosa_litany` | julio · Juan XXIII | `lamb` | **have** |
| `loreto` | Letanía de Loreto | `embedded` | `sangrepreciosa_litany` | en cierres del Rosario | `galleryMaterImmaculata` | **have** |
| `st_michael` | San Miguel | `breve` | `michael` | León XIII · 1886 | `galleryStMichael` | **have** |
| `st_expeditus` | San Expedito | `breve` | `expedito` | causas urgentes · HODIE | `gallerySanExpedito` | **have** |
| `immaculate_heart` | Inmaculado Corazón | `recorrido` | `inmaculado_corazon` | Fátima · 7 pasos | `galleryMaterImmaculata` | **have** (v0.3.86) |
| `holy_spirit` | Espíritu Santo | `recorrido` | `espiritu_santo_novena` | Pentecostés · 9 días | `galleryPentecost` | **have** (v0.3.86) |
| `scapular` | Escapulario | `breve` | `escapulario` | Carmen · s. XIII | `maryCarmen` | **have** (v0.3.86) |
| `miraculous_medal` | Medalla Milagrosa | `recorrido` | `medalla_milagrosa` | Catalina Labouré · 3 pasos | `allMary17th` | **have** (v0.3.86) |
| `memorare` | Memorare | `recorrido` | `memorare` | San Bernardo · ES/EN/LA | `reginaCaeli` | **have** (v0.3.86) |
| `st_joseph` | San José | `soon` | *null* | patrono universal | `earlyChristian` | **soon** (blocked on art) |

---

## Wire Points & Code Verification

| Concern | Path |
|---------|------|
| Catalog definition | `src/data/historicDevotionsCatalog.js` |
| Optional prayers (breves) | `src/data/optionalPrayers.js` |
| Sequence builder | `src/utils/bookletSequence.js` |
| Shelf UI components | `src/components/Views/BookletView.jsx` + `src/components/Views/DevotionsShelf.jsx` |
| Devotion registry & rose guards | `src/data/historicDevotionsCatalog.js` (`earnsRoseForDevotion`, `hidesRosaryPills`, `NOVENA_DEVOTIONS`) |
| Mandatory tests | `src/__tests__/historicDevotionsCatalog.test.js` |

> [!IMPORTANT]
> **Prayer images mandatory:** Every new devotion step must include `img` and non-empty `imgCandidates` (see `.cursor/rules/prayer-images.mdc`). San José is currently held in `soon` specifically because own curated art has not yet been placed in `public/prayers/SJO_*/`.
