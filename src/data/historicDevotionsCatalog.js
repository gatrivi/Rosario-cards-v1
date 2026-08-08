/**
 * Popular Christian / Catholic devoutions through history.
 * `status`: 'have' already in Libro · 'soon' B&W shelf preview · add separately.
 * Thumbnails prefer modooscuro / stained-glass gallery art.
 */
import { imagePath } from './imageRegistry';

export const HISTORIC_DEVOTIONS = [
  {
    id: 'rosary',
    label: 'Rosario',
    note: 's. XIII–XV · popularísimo',
    status: 'have',
    imgId: 'magnificatVisitation',
  },
  {
    id: 'stations',
    label: 'Vía Crucis',
    note: 'estaciones · pasión',
    status: 'have',
    imgId: 'vitreauxCruz',
  },
  {
    id: 'eucharist',
    label: 'Eucaristía',
    note: 'adoración / Corpus',
    status: 'have',
    imgId: 'gallerySagradoCorazon',
  },
  {
    id: 'sacred_heart',
    label: 'Sagrado Corazón',
    note: 's. XVII · Alacoque',
    status: 'have',
    imgId: 'gallerySagradoCorazon',
  },
  {
    id: 'angelus',
    label: 'Ángelus',
    note: 'oración del día',
    status: 'have',
    imgId: 'allMary17th',
  },
  {
    id: 'divine_mercy',
    label: 'Divina Misericordia',
    note: 'Faustina · s. XX',
    status: 'have',
    imgId: 'faustinaStainedGlass',
  },
  {
    id: 'precious_blood',
    label: 'Preciosísima Sangre',
    note: 'julio · Juan XXIII',
    status: 'have',
    imgId: 'lamb',
  },
  {
    id: 'loreto',
    label: 'Letanía de Loreto',
    note: 'en cierres del Rosario',
    status: 'have',
    imgId: 'galleryMaterImmaculata',
  },
  // ── not yet as shelf devoutions ──
  {
    id: 'st_michael',
    label: 'San Miguel',
    note: 'León XIII · 1886',
    status: 'have',
    imgId: 'galleryStMichael',
  },
  {
    id: 'st_expeditus',
    label: 'San Expedito',
    note: 'causas urgentes · HODIE',
    status: 'have',
    imgId: 'gallerySanExpedito',
  },
  {
    id: 'immaculate_heart',
    label: 'Inmaculado Corazón',
    note: 'Mateo · Fátima',
    status: 'soon',
    imgId: 'galleryMaterImmaculata',
  },
  {
    id: 'holy_spirit',
    label: 'Espíritu Santo',
    note: 'Pentecostés / novena',
    status: 'soon',
    imgId: 'galleryPentecost',
  },
  {
    id: 'scapular',
    label: 'Escápulario',
    note: 'Carmen · s. XIII',
    status: 'soon',
    imgId: 'theotokos',
  },
  {
    id: 'miraculous_medal',
    label: 'Medalla Milagrosa',
    note: 'Catalina Labouré',
    status: 'soon',
    imgId: 'allMary17th',
  },
  {
    id: 'st_joseph',
    label: 'San José',
    note: 'patrono de la Iglesia',
    status: 'soon',
    imgId: 'earlyChristian',
  },
  {
    id: 'memorare',
    label: 'Memorare',
    note: 'San Bernardo',
    status: 'soon',
    imgId: 'theotokos',
  },
];

export function upcomingDevotionThumbs() {
  return HISTORIC_DEVOTIONS.filter((d) => d.status === 'soon').map((d) => ({
    ...d,
    img: imagePath(d.imgId),
  }));
}

export function historicDevotionThumb(id) {
  const d = HISTORIC_DEVOTIONS.find((x) => x.id === id);
  return d ? imagePath(d.imgId) : null;
}
