/**
 * Memorare — the closing prayer of the Rosary, traditionally attributed to
 * St. Bernard of Clairvaux (s. XII). One prayer, three languages: the Spanish
 * form used in the Libro, the English, and the Latin original.
 *
 * Public-domain traditional text.
 */
import { imagePath } from './imageRegistry';

export const MEMORARE_ID = 'memorare';

export const memorareThumbnail = imagePath('maryPrayingSassoferrato') || imagePath('galleryVirgoImmaculata');

/** Single step: the prayer carries its own language variants. */
export const memorareSteps = [
  {
    id: 'MEM',
    title: 'Memorare',
    text:
      'Acuérdate, Virgen Madre, estando tú en la presencia de Dios, para que hables por nosotros cosas buenas. ' +
      'Y no sea en balde nuestra vida, si en tu presencia no ofrecemos nada que merezca recompensa; ' +
      'tú, Madre, preséntate a nuestra súplica.',
    img: imagePath('galleryVirgoImmaculata'),
    imgCandidates: [
      imagePath('galleryVirgoImmaculata'),
      imagePath('galleryMaterImmaculata'),
    ],
  },
];

export const MEMORARE_VARIANTS = {
  MEM: [
    {
      id: 'es',
      label: 'Español',
      text:
        'Acuérdate, Virgen Madre, estando tú en la presencia de Dios, para que hables por nosotros cosas buenas. ' +
        'Y no sea en balde nuestra vida, si en tu presencia no ofrecemos nada que merezca recompensa; ' +
        'tú, Madre, preséntate a nuestra súplica.',
    },
    {
      id: 'en',
      label: 'English',
      text:
        'Remember, O Virgin Mother, as you stand in the sight of God, to speak good things for us. ' +
        'And that our life is not thrown away, if we offer nothing to you that can deserve reward; ' +
        'you, Mother, present our prayer to him.',
    },
    {
      id: 'latin',
      label: 'Latín',
      text:
        'Recorda, Virgo Mater, dum steteris in conspectu Dei,\nut loquaris pro nobis bona.\n' +
        'Et ut aetas nostra non sit in irritum,\n' +
        'si coram te nil offerimus meritorum,\n' +
        'tu, Mater, praesentia nostrae deprecationis.',
    },
  ],
};

export function isMemorareMode(misterioActual) {
  return misterioActual === MEMORARE_ID;
}

export function getMemorareSequence() {
  return memorareSteps.map((step) => ({
    ...step,
    variants: MEMORARE_VARIANTS[step.id] || null,
  }));
}

export { getImage } from './imageRegistry';
