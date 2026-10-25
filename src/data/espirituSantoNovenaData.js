/**
 * Novena al Espíritu Santo — 9 days leading to Pentecost.
 *
 * Each step: the antiphon of *Veni Creator Spiritus* (the same words every day,
 * by design), then that day's single intention. The day picker is driven by
 * `NOVENA_DEVOTIONS` in `bookletSequence.js`, so no chrome here is hardcoded.
 */
import { imagePath } from './imageRegistry';
import {
  VENI_ANTIPHON,
  SPIRIT_DAY_INTENTION,
  getSpiritNovenaDay,
} from './holySpiritNovenaData';

export const ESPIRITU_SANTO_ID = 'espiritu_santo_novena';

export const holySpiritNovenaThumbnail = imagePath('vitralEspirituSanto') || imagePath('galleryPentecost');

/** Chapel steps shared by every day, after the intention. */
const CHAPLET = [
  { id: 'EF', title: 'Padre Eterno', text: 'Padre eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu amadísimo Hijo, nuestro Señor Jesucristo, como expiación de nuestros pecados y los del mundo entero.', img: imagePath('lamb') },
  { id: 'MP', title: 'Por su dolorosa Pasión', text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.', img: imagePath('vitreauxCruz') },
  { id: 'HG', title: 'Santo Dios', text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten misericordia de nosotros y del mundo entero.', img: imagePath('stainedGlass') },
];

export function isEspirituSantoMode(misterioActual) {
  return misterioActual === ESPIRITU_SANTO_ID;
}

/** The step image for any step in the novena, honouring the selected day. */
export function resolveSpiritStepImage(prayerId, { novenaDay = 1 } = {}) {
  if (prayerId === SPIRIT_DAY_INTENTION) {
    return getSpiritNovenaDay(novenaDay).img;
  }
  if (prayerId === VENI_ANTIPHON.id) {
    return imagePath('galleryPentecost');
  }
  return CHAPLET.find((c) => c.id === prayerId)?.img || imagePath('galleryPentecost');
}

export function getEspirituSantoSequence(novenaDay = 1) {
  const day = getSpiritNovenaDay(novenaDay);

  const intention = {
    id: SPIRIT_DAY_INTENTION,
    title: `${day.title} — ${day.intentionTitle}`,
    text: day.intentionText,
    img: day.img,
  };

  return [intention, VENI_ANTIPHON, ...CHAPLET].map((step) => ({
    ...step,
    img: step.img || resolveSpiritStepImage(step.id, { novenaDay }),
    imgCandidates: [step.img || resolveSpiritStepImage(step.id, { novenaDay })],
  }));
}

export { getImage } from './imageRegistry';
