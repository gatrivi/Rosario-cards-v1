/**
 * Medalla Milagrosa — the Miraculous Medal, given to St. Catherine Labouré
 * (Hijas de la Caridad, Paris) on 27 November 1830. Feast: 27 de noviembre.
 *
 * Built from the medal's own engraved elements rather than an invented litany:
 *   1. La Llamada         — the motto struck around the reverse: "O Mary
 *                           conceived without sin, pray for us who have
 *                           recourse to you"
 *   2. Las doce estrellas — the twelve stars of Revelation 12:1
 *   3. Los dos corazones  — the Sacred Heart and the Immaculated Heart, fulfilling
 *                           Simeon's prophecy at the Presentation (Luke 2:35)
 *
 * Scripture in the public-domain Reina-Valera 1909 wording.
 */
import { imagePath } from './imageRegistry';

export const MILAGROSA_ID = 'medalla_milagrosa';

export const milagrosaThumbnail =
  imagePath('vitralMilagrosa') || imagePath('allMary17th');

const MARIA_IMMACULATA = [
  imagePath('allMary17th'),
  imagePath('galleryMaterImmaculata'),
  imagePath('galleryVirgoImmaculata'),
].filter(Boolean);

const CORAZONES = [
  imagePath('gallerySagradoCorazon'),
  imagePath('gallerySagradoCorazon2'),
].filter(Boolean);

const first = (list, fallback) => list[0] || fallback;

/** Step 1 — the medal's motto, carried identically in the three languages. */
const LLAMADA = {
  id: 'MM_LLAMADA',
  title: 'La Llamada',
  text: 'Oh María sin pecado concebida, ruega por nosotros los que recurrimos a ti.',
  img: first(MARIA_IMMACULATA, null),
  imgCandidates: MARIA_IMMACULATA,
  variants: [
    {
      id: 'es',
      label: 'Español',
      text: 'Oh María sin pecado concebida, ruega por nosotros los que recurrimos a ti.',
    },
    {
      id: 'en',
      label: 'English',
      text: 'O Mary conceived without sin, pray for us who have recourse to you.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text: 'O Maria, sine labe concepta, ora pro nobis qui ad te recurimus.',
    },
  ],
};

/** Step 2 — the twelve stars ringing the reverse. */
const DOCE_ESTRELLAS = {
  id: 'MM_ESTRELLAS',
  title: 'Las doce estrellas',
  text:
    'Y apareció una gran señal en el cielo: una mujer vestida de sol, con la luna bajo sus pies, ' +
    'y sobre su cabeza una corona de doce estrellas. Y dando un grito de grande voz, como cuando ' +
    'ruge un león, la tierra tembló.\n\n(Apocalipsis 12, 1-2)',
  img: first(MARIA_IMMACULATA.slice(1), first(MARIA_IMMACULATA, null)),
  imgCandidates: MARIA_IMMACULATA,
};

/** Step 3 — the two hearts on the reverse, side by side. */
const DOS_CORAZONES = {
  id: 'MM_CORAZONES',
  title: 'Los dos corazones',
  text:
    'Y una espada te traspasará el alma, tu misma alma; y tu propia espada te penetrarán.\n\n' +
    'Dos corazones aparecen en el reverso de la medalla: el de Jesús, coronado de espinas, ' +
    'y el de María, atravesado por una espada. Juntos señalan la intimidad de María con Jesús.\n\n' +
    '(Lucas 2, 35)',
  img: first(CORAZONES, first(MARIA_IMMACULATA, null)),
  imgCandidates: CORAZONES.length ? CORAZONES : MARIA_IMMACULATA,
};

export const milagrosaSteps = [LLAMADA, DOCE_ESTRELLAS, DOS_CORAZONES];

export function isMedallaMilagrosaMode(misterioActual) {
  return misterioActual === MILAGROSA_ID;
}

export function getMedallaMilagrosaSequence() {
  return milagrosaSteps.map((step) => ({
    ...step,
    img: step.img || imagePath('galleryMaterImmaculata'),
    imgCandidates: step.imgCandidates?.length ? step.imgCandidates : [step.img],
  }));
}

export { getImage } from './imageRegistry';
