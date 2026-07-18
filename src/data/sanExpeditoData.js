import { imagePath } from './imageRegistry';

export const SAN_EXPEDITO_ID = 'sanexpedito';
export const SAN_EXPEDITO_SHARE_PATH = '/san-expedito/';

const imageIds = [
  'gallerySanExpeditoBalvanera',
  'gallerySanExpedito',
  'galleryCruzVsRoma',
  'vitreauxCruz',
];

const imgCandidates = imageIds.map(imagePath).filter(Boolean);
export const sanExpeditoThumbnail = imgCandidates[0];

export const SAN_EXPEDITO_SEQUENCE = [
  {
    id: 'EXP_ORACION',
    title: 'Oración a San Expedito',
    text:
      '¡Glorioso San Expedito!, que intercedes por las causas justas y urgentes, ayúdame en este momento de aflicción.\n\nIntercede por mi pedido ante nuestro Señor Jesucristo. Tú que eres el Santo de la fidelidad y el coraje, atiende mi pedido (nuestra necesidad), escúchame y protégeme de todo mal.\n\nTe pido por mi familia y que descienda la paz. Haz que me una cada día más a Jesús y a María, su Madre, para que convierta mi corazón y llegue a gozar un día de su presencia. Amén.',
    img: imgCandidates[0],
    imgCandidates,
  },
  {
    id: 'EXP_INVOCACION',
    title: 'Invocación final',
    text: 'San Expedito, ¡ruega por nosotros!',
    img: imgCandidates[1] || imgCandidates[0],
    imgCandidates,
  },
];

export function isSanExpeditoMode(mysteryType) {
  return mysteryType === SAN_EXPEDITO_ID;
}

export function getSanExpeditoSequence() {
  return SAN_EXPEDITO_SEQUENCE;
}
