import { imagePath } from './imageRegistry';
import { divineMercyNovenaDays } from './divineMercyNovenaData';

export const DIVINE_MERCY_ID = 'divinamisericordia';
export const DIVINE_MERCY_NOVENA_ID = 'divinamisericordia_novena';

/** Single header thumb — Faustina vitral for both Corona and Novena. */
export const faustinaThumb = imagePath('faustinaStainedGlass');

export const faustinaVitral = imagePath('faustinaDivinoCorazon');
export const chapletThumbnail = faustinaVitral;
export const novenaThumbnail = faustinaThumb;
export const faustinaThumbnail = faustinaThumb;

const MERCY_DECADES = Array.from({ length: 5 }, () => [
  'EF',
  ...Array(10).fill('MP'),
]).flat();

export const RDM_KEYS = [
  'SC',
  'DMO1',
  'DMO2',
  'P',
  'A',
  'C',
  ...MERCY_DECADES,
  'HG',
  'HG',
  'HG',
];

/** One image per EF (Padre Eterno) at the start of each decade. */
const EF_DECADE_IMAGES = [
  imagePath('lamb'),
  imagePath('theotokos'),
  imagePath('earlyChristian'),
  imagePath('reginaCaeli'),
  imagePath('faustinaDivinoCorazon'),
];

/** One image per MP decade (5 × 10 beads). */
const MP_DECADE_IMAGES = [
  imagePath('crux'),
  imagePath('vitreauxCruz'),
  imagePath('lamb'),
  imagePath('faustinaDivinoCorazon'),
  imagePath('stainedGlass'),
];

/** One image per HG triplet at the close. */
const HG_TRIPLET_IMAGES = [
  imagePath('stainedGlass'),
  imagePath('sanctusBenedictus'),
  imagePath('byzantineArt'),
];

/** Opening / shared prayers not stored in divineMercyPrayers. */
const MERCY_OPENING_IMAGES = {
  SC: imagePath('encountersCathedral'),
  P: imagePath('latinPaterNoster'),
  A: imagePath('latinAveMaria'),
  C: imagePath('galleryLatinCredo'),
};

export const divineMercyPrayers = [
  {
    id: 'DMO1',
    title: 'Oración opcional — Expiraste, Jesús',
    img: imagePath('faustinaDivinoCorazon'),
    text:
      'Expiraste, Jesús, pero el manantial de vida brotó para las almas, y el océano de misericordia se abrió para el mundo entero.\n\nOh Fuente de Vida, inagotable Misericordia Divina, envuelve el mundo entero y derrama Te sobre nosotros.',
  },
  {
    id: 'DMO2',
    title: 'Oración opcional — Sangre y Agua',
    img: imagePath('vitreauxCruz'),
    text:
      '¡Oh Sangre y Agua, que brotaste del Corazón de Jesús como fuente de misericordia para nosotros, en Ti confío!',
  },
  {
    id: 'EF',
    title: 'Padre Eterno',
    img: imagePath('lamb'),
    text:
      'Padre eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu amadísimo Hijo, nuestro Señor Jesucristo, como expiación de nuestros pecados y los del mundo entero.',
  },
  {
    id: 'MP',
    title: 'Por su dolorosa Pasión',
    img: imagePath('crux'),
    text:
      'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
  },
  {
    id: 'HG',
    title: 'Santo Dios',
    img: imagePath('stainedGlass'),
    text:
      'Santo Dios, Santo Fuerte, Santo Inmortal, ten misericordia de nosotros y del mundo entero.',
  },
];

function mercyDecadeAt(sequence, index) {
  let decade = 0;
  for (let i = 0; i <= index; i += 1) {
    if (sequence[i]?.id === 'EF') decade += 1;
  }
  return decade || 1;
}

function holyGodRunAt(sequence, index) {
  let run = 0;
  for (let i = 0; i <= index; i += 1) {
    if (sequence[i]?.id === 'HG') run += 1;
  }
  return run || 1;
}

/**
 * Resolve the vitral for a Divine Mercy / Novena sequence step.
 * @param {string} prayerId
 * @param {{ sequenceIndex: number, sequence: Array<{id: string}>, novenaDay?: number }} ctx
 */
export function resolveMercyStepImage(prayerId, { sequenceIndex, sequence, novenaDay = 1 }) {
  if (prayerId === 'NOVENA_DAY_INTENTION') {
    const day = divineMercyNovenaDays.find((d) => d.day === novenaDay) || divineMercyNovenaDays[0];
    return day.img || faustinaThumb;
  }

  if (prayerId === 'EF') {
    const decade = mercyDecadeAt(sequence, sequenceIndex);
    return EF_DECADE_IMAGES[(decade - 1) % EF_DECADE_IMAGES.length];
  }

  if (prayerId === 'MP') {
    const decade = mercyDecadeAt(sequence, sequenceIndex);
    return MP_DECADE_IMAGES[(decade - 1) % MP_DECADE_IMAGES.length];
  }

  if (prayerId === 'HG') {
    const run = holyGodRunAt(sequence, sequenceIndex);
    return HG_TRIPLET_IMAGES[(run - 1) % HG_TRIPLET_IMAGES.length];
  }

  if (MERCY_OPENING_IMAGES[prayerId]) {
    return MERCY_OPENING_IMAGES[prayerId];
  }

  const typed = divineMercyPrayers.find((p) => p.id === prayerId);
  return typed?.img || faustinaThumb;
}

export function isDivineMercyMystery(misterioActual) {
  return misterioActual === DIVINE_MERCY_ID || misterioActual === DIVINE_MERCY_NOVENA_ID;
}

export { getImage } from './imageRegistry';
