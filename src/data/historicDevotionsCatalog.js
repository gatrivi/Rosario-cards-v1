/**
 * Popular Christian / Catholic devotions through history — the shelf's index.
 *
 * Every entry names the surface where the devotion actually lives, so the
 * catalog can never drift from the app again:
 *   - `vias`      the four rosary mysteries (no single shelf item)
 *   - `recorrido` a Libro sequence id — `targetId` is in BOOKLET_MYSTERY_IDS
 *   - `breve`     an optional prayer sheet entry — `targetId` is in OPTIONAL_PRAYERS
 *   - `embedded`  folded into another surface; no shelf item of its own
 *   - `soon`      not built yet — `targetId` is null, shown B&W as a preview
 *
 * `src/__tests__/historicDevotionsCatalog.test.js` resolves every `targetId`
 * against the real id registries, so a rename or a dropped devotion fails CI.
 * A `soon` entry may carry `blockedBy` explaining exactly what unblocks it.
 * Thumbnails prefer modooscuro / stained-glass gallery art.
 */
import { imagePath } from './imageRegistry';

export const HISTORIC_DEVOTIONS = [
  {
    id: 'rosary',
    label: 'Rosario',
    note: 's. XIII–XV · popularísimo',
    surface: 'vias',
    targetId: null,
    imgId: 'magnificatVisitation',
  },
  {
    id: 'stations',
    label: 'Vía Crucis',
    note: 'estaciones · pasión',
    surface: 'recorrido',
    targetId: 'viacrucis',
    imgId: 'vitreauxCruz',
  },
  {
    id: 'eucharist',
    label: 'Eucaristía',
    note: 'adoración / Corpus',
    surface: 'embedded',
    targetId: 'sagrado_corazon_adoracion',
    imgId: 'gallerySagradoCorazon',
  },
  {
    id: 'sacred_heart',
    label: 'Sagrado Corazón',
    note: 's. XVII · Alacoque',
    surface: 'recorrido',
    targetId: 'sagrado_corazon_adoracion',
    imgId: 'gallerySagradoCorazon',
  },
  {
    id: 'angelus',
    label: 'Ángelus',
    note: 'oración del día',
    surface: 'recorrido',
    targetId: 'angelus',
    imgId: 'allMary17th',
  },
  {
    id: 'divine_mercy',
    label: 'Divina Misericordia',
    note: 'Faustina · s. XX',
    surface: 'recorrido',
    targetId: 'divinamisericordia',
    imgId: 'faustinaStainedGlass',
  },
  {
    id: 'precious_blood',
    label: 'Preciosísima Sangre',
    note: 'julio · Juan XXIII',
    surface: 'recorrido',
    targetId: 'sangrepreciosa_litany',
    imgId: 'lamb',
  },
  {
    id: 'loreto',
    label: 'Letanía de Loreto',
    note: 'en cierres del Rosario',
    surface: 'embedded',
    targetId: 'sangrepreciosa_litany',
    imgId: 'galleryMaterImmaculata',
  },
  // ── lives as an "oración breve" (optional prayer sheet), not a recorrido ──
  {
    id: 'st_michael',
    label: 'San Miguel',
    note: 'León XIII · 1886',
    surface: 'breve',
    targetId: 'michael',
    imgId: 'galleryStMichael',
  },
  {
    id: 'st_expeditus',
    label: 'San Expedito',
    note: 'causas urgentes · HODIE',
    surface: 'breve',
    targetId: 'expedito',
    imgId: 'gallerySanExpedito',
  },
  // ── not yet as shelf devotions ──
  {
    id: 'immaculate_heart',
    label: 'Inmaculado Corazón',
    note: 'Mateo · Fátima',
    surface: 'recorrido',
    targetId: 'inmaculado_corazon',
    imgId: 'galleryMaterImmaculata',
  },
  {
    id: 'holy_spirit',
    label: 'Espíritu Santo',
    note: 'Pentecostés / novena',
    surface: 'recorrido',
    targetId: 'espiritu_santo_novena',
    imgId: 'galleryPentecost',
  },
  {
    id: 'scapular',
    label: 'Escápulario',
    note: 'Carmen · s. XIII',
    surface: 'breve',
    targetId: 'escapulario',
    imgId: 'carmenStatue',
  },
  {
    id: 'miraculous_medal',
    label: 'Medalla Milagrosa',
    note: 'Catalina Labouré',
    surface: 'recorrido',
    targetId: 'medalla_milagrosa',
    imgId: 'allMary17th',
  },
  {
    id: 'st_joseph',
    label: 'San José',
    note: 'patrono de la Iglesia',
    surface: 'soon',
    targetId: null,
    imgId: 'earlyChristian',
    // The repo holds no San José art. The one Joseph-adjacent file is a
    // "Christ as King" window from St Joseph's Church, which would be a
    // semantic mismatch, so this waits for real art rather than shipping a
    // placeholder. See agents.md: never merge an image-less prayer.
    blockedBy:
      'Own art: drop a San José image into public/prayers/SJO_*/ , then set surface ' +
      "'recorrido' and targetId. Prayer ids to build: SJO_SC, SJO_LABOR, SJO_MORIR, SJO_PIDE, SJO_FIGURA.",
  },
  {
    id: 'memorare',
    label: 'Memorare',
    note: 'San Bernardo',
    surface: 'recorrido',
    targetId: 'memorare',
    imgId: 'galleryVirgoImmaculata',
  },
];

/** Devotions with no Libro surface yet — the shelf's "Próximas" preview row. */
export function upcomingDevotions() {
  return HISTORIC_DEVOTIONS.filter((d) => d.surface === 'soon');
}

export function upcomingDevotionThumbs() {
  return upcomingDevotions().map((d) => ({
    ...d,
    img: imagePath(d.imgId),
  }));
}

export function historicDevotionThumb(id) {
  const d = HISTORIC_DEVOTIONS.find((x) => x.id === id);
  return d ? imagePath(d.imgId) : null;
}
