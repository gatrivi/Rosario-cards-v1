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

## Próximas (B/N)

- Built by `upcomingDevotionThumbs()` (`status === 'soon'`).
- `MercyWindowThumb` + `soon` → greyscale CSS (`.mercy-window-thumb--soon`).
- Promoting one: implement sequence/optional entry → set catalog `status: 'have'` → remove from Próximas automatically.

## Wire points

| Concern | Path |
|---------|------|
| Catalog | `src/data/historicDevotionsCatalog.js` |
| Optional texts | `src/data/optionalPrayers.js` |
| Registry art | `src/data/imageRegistry.js` (`galleryStMichael`, `galleryMaterImmaculata`, `galleryPentecost`, …) |
| Shelf | `BookletView.jsx` + `DevotionsShelf.jsx` |
| Tests | `src/__tests__/historicDevotionsCatalog.test.js` |

## Prayer images rule

New live devoutions still need `img` + non-empty `imgCandidates` on every step (see `.cursor/rules/prayer-images.mdc`).
