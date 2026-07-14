# Historic Christian devoutions (Libro shelf)

**v0.3.59+** · Source of truth: `src/data/historicDevotionsCatalog.js`  
UI: Libro → Devociones (`DevotionsShelf`) · rows **Devociones** / **Oraciones breves** / **Próximas**

Prefer **modooscuro / stained-glass** thumbs (`imageRegistry` ids).

## Status legend

| `status` | Meaning |
|----------|---------|
| `have` | Live in Libro (mystery, recorrido, breve, or rosary close) |
| `soon` | Shelf **Próximas** — B/N greyscale, `disabled` / `soon` thumb |
| `add` | Temporary while shipping; then flip to `have` |

## Month & season calendar (special prayers)

Popular piety (not dogma). **App** = wired in Libro; **próx.** = B/N shelf; **—** = not in catalog yet.

| When | Traditional focus | Special prayers / practice | App |
|------|-------------------|----------------------------|-----|
| **Jan** | Holy Name / Childhood of Jesus | Litany of the Holy Name; Infant Jesus | — |
| **Feb** | Holy Family / Purification | Presentation; Holy Family prayers | — |
| **Mar** | St Joseph · Passion | St Joseph (19); Via Crucis (Lent) | Joseph **próx.** · Via Crucis **have** |
| **Apr** | Eucharist · Resurrection · Holy Spirit | Adoration; Via Lucis (Easter); Pentecost novena | SC/Eucharist **have** · Via Lucis **have** · Espíritu Santo **próx.** |
| **May** | Blessed Virgin Mary | Rosary; Loreto; May crowning; Ángelus | Rosario / Loreto / Ángelus / Magnificat **have** |
| **Jun** | Sacred Heart | Litany SC; First Fridays; consecration | Sagrado Corazón **have** |
| **Jul** | Precious Blood | Litany / corona / 7 ofrendas | Sangre (3 modes) **have** · `PRECIOUS_BLOOD_MONTH = 6` |
| **Aug** | Immaculate Heart · Assumption | Consecration to Inmaculado Corazón; Assumption (15) | Inmaculado Corazón **próx.** |
| **Sep** | Seven Sorrows · Holy Cross | Dolores (15); Exaltation of the Cross (14) | — (Via Crucis covers Passion) |
| **Oct** | Holy Rosary · Holy Angels | Daily Rosary; Our Lady of the Rosary (7); St Michael | Rosario **have** · San Miguel **have** |
| **Nov** | Holy Souls | All Saints (1); All Souls (2); office for dead | — |
| **Dec** | Immaculate Conception · Nativity | IC (8); Advent; Nativity; Memorare | Memorare **próx.** · IC art via Mater Immaculata |

### Movable / dated (not month-fixed)

| Window | Prayer / devotion | App |
|--------|-------------------|-----|
| Good Friday → Divine Mercy Sunday | **Novena de la Divina Misericordia** (9 days) | **have** (`divinamisericordia_novena` + day auto-advance) |
| Eastertide | Via Lucis | **have** |
| Lent | Via Crucis | **have** |
| First Fridays | Sacred Heart | covered by SC recorrido |
| First Saturdays | Immaculate Heart / Fatima | needs Inmaculado Corazón (**próx.**) |
| Sep 29 | St Michael (feast) | San Miguel breve **have** |
| Oct 2 | Holy Guardian Angels | Ángel Guarda **have** |
| Corpus Christi / Sacred Heart Friday | Eucharist / SC | **have** |

### Near-term for this repo (from mid‑2026)

- **Jul (now):** emphasize Preciosísima Sangre shelf items.
- **Aug next:** promote **Inmaculado Corazón** from Próximas when ready.
- **Oct:** already covered (Rosario + San Miguel); optional angel emphasis.
- **Nov:** Holy Souls still missing — candidate for Próximas later.
- **Mercy week:** Novena Misericordia (see `novenaAutoProgress.js`).

No auto month-switch in UI yet — shelf copy / titles mention Julio for Sangre; seasonal promote is manual / agent checklist.

## Catalog

| Id | Label | Note | Art (`imgId`) | Status |
|----|-------|------|---------------|--------|
| `rosary` | Rosario | s. XIII–XV | `magnificatVisitation` | have |
| `stations` | Vía Crucis | estaciones | `vitreauxCruz` | have |
| `eucharist` | Eucaristía | adoración / Corpus | `gallerySagradoCorazon` | have |
| `sacred_heart` | Sagrado Corazón | Alacoque | `gallerySagradoCorazon` | have |
| `angelus` | Ángelus | oración del día | `latinAngelus` | have |
| `divine_mercy` | Divina Misericordia | Faustina | `faustinaStainedGlass` | have |
| `precious_blood` | Preciosísima Sangre | julio | `lamb` | have |
| `loreto` | Letanía de Loreto | cierres del Rosario | `galleryMaterImmaculata` | have |
| `st_michael` | San Miguel | León XIII · 1886 | `galleryStMichael` | **have** (v0.3.59 breve) |
| `immaculate_heart` | Inmaculado Corazón | Fátima | `galleryMaterImmaculata` | soon |
| `holy_spirit` | Espíritu Santo | Pentecostés | `galleryPentecost` | soon |
| `scapular` | Escápulario | Carmen | `theotokos` | soon |
| `miraculous_medal` | Medalla Milagrosa | Labouré | `allMary17th` | soon |
| `st_joseph` | San José | patrono | `earlyChristian` | soon |
| `memorare` | Memorare | S. Bernardo | `reginaCaeli` | soon |

Also on shelf but outside this table: Magnificat, Ángel Guarda, San Benito, Sangre (litany/corona/ofrendas), Via Lucis, Novena Misericordia.

## San Miguel (shipped)

- **Why first among missing:** canonical protection prayer; dedicated vitral already in gallery.
- **Data:** `optionalPrayers.js` → `id: 'michael'` (ES / EN / LA).
- **Thumb:** `galleryStMichael` → `public/gallery-images/litany/modooscuro/Stained glass of St_ Michael the Archangel.jpg`
- **UI:** Oraciones breves → San Miguel (badge `SM`); opens `OptionalPrayerSheet`.
- **Dates:** feast **29 Sep**; traditional with Holy Angels in **October**.

## Próximas (B/N)

- Built by `upcomingDevotionThumbs()` (`status === 'soon'`).
- `MercyWindowThumb` + `soon` → greyscale CSS (`.mercy-window-thumb--soon`).
- Promoting one: implement sequence/optional entry → set catalog `status: 'have'` → remove from Próximas automatically.
- Prefer promoting by **month** (Aug → Inmaculado Corazón; Mar → San José; etc.).

## Wire points

| Concern | Path |
|---------|------|
| Catalog | `src/data/historicDevotionsCatalog.js` |
| Optional texts | `src/data/optionalPrayers.js` |
| Registry art | `src/data/imageRegistry.js` (`galleryStMichael`, `galleryMaterImmaculata`, `galleryPentecost`, …) |
| Shelf | `BookletView.jsx` + `DevotionsShelf.jsx` |
| July month constant | `preciousBloodData.js` → `PRECIOUS_BLOOD_MONTH` |
| Mercy novena day | `novenaAutoProgress.js` |
| Tests | `src/__tests__/historicDevotionsCatalog.test.js` |

## Prayer images rule

New live devoutions still need `img` + non-empty `imgCandidates` on every step (see `.cursor/rules/prayer-images.mdc`).
