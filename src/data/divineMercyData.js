import faustinaVitralImg from './assets/img/santafaustinadivinocorazon.jpg';
import faustinaThumbImg from './assets/img/santafaustinastainedglass.jpg';

export const DIVINE_MERCY_ID = 'divinamisericordia';
export const faustinaThumbnail = faustinaThumbImg;
export const faustinaVitral = faustinaVitralImg;

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

export const divineMercyPrayers = [
  {
    id: 'DMO1',
    title: 'Oración opcional — Expiraste, Jesús',
    img: faustinaVitralImg,
    text:
      'Expiraste, Jesús, pero el manantial de vida brotó para las almas, y el océano de misericordia se abrió para el mundo entero.\n\nOh Fuente de Vida, inagotable Misericordia Divina, envuelve el mundo entero y derrama Te sobre nosotros.',
  },
  {
    id: 'DMO2',
    title: 'Oración opcional — Sangre y Agua',
    img: faustinaVitralImg,
    text:
      '¡Oh Sangre y Agua, que brotaste del Corazón de Jesús como fuente de misericordia para nosotros, en Ti confío!',
  },
  {
    id: 'EF',
    title: 'Padre Eterno',
    img: faustinaVitralImg,
    text:
      'Padre eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu amadísimo Hijo, nuestro Señor Jesucristo, como expiación de nuestros pecados y los del mundo entero.',
  },
  {
    id: 'MP',
    title: 'Por su dolorosa Pasión',
    img: faustinaVitralImg,
    text:
      'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
  },
  {
    id: 'HG',
    title: 'Santo Dios',
    img: faustinaVitralImg,
    text:
      'Santo Dios, Santo Fuerte, Santo Inmortal, ten misericordia de nosotros y del mundo entero.',
  },
];
