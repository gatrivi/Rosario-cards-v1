import RosarioPrayerBook from '../data/RosarioPrayerBook';
import { getPrayerData } from '../components/Views/RoseView';
import { getPrayerVariants } from '../data/prayerVariants';
import {
  getPrayerImageCandidates,
  resolvePrayerImage,
} from './prayerImages';
import {
  DIVINE_MERCY_ID,
  RDM_KEYS,
  faustinaVitral,
} from '../data/divineMercyData';

export const ROSARY_MYSTERY_IDS = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'];

const SEQ_MAP = {
  gozosos: 'RGo',
  dolorosos: 'RDo',
  gloriosos: 'RGl',
  luminosos: 'RL',
};

export function resolveRosaryMystery(misterioActual) {
  return ROSARY_MYSTERY_IDS.includes(misterioActual) ? misterioActual : 'dolorosos';
}

export function isDivineMercyMode(misterioActual) {
  return misterioActual === DIVINE_MERCY_ID;
}

/** Libro-only lookup — keeps chaplet data out of RoseView.getPrayerData. */
function getBookletPrayerData(id, mysteryType) {
  if (mysteryType === DIVINE_MERCY_ID) {
    return (
      RosarioPrayerBook.divinamisericordia?.find((p) => p.id === id) ||
      RosarioPrayerBook.apertura?.find((p) => p.id === id) ||
      RosarioPrayerBook.decada?.find((p) => p.id === id) ||
      null
    );
  }
  return getPrayerData(id, mysteryType);
}

function getSequenceKeys(mysteryType, includeMercyOpening = true) {
  if (mysteryType === DIVINE_MERCY_ID) {
    if (includeMercyOpening) return RDM_KEYS;
    return RDM_KEYS.filter((id) => id !== 'DMO1' && id !== 'DMO2');
  }
  return RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
}

export function buildSequence(mysteryType, options = {}) {
  const { includeMercyOpening = true } = options;
  const keys = getSequenceKeys(mysteryType, includeMercyOpening);
  const isMercy = mysteryType === DIVINE_MERCY_ID;

  return keys
    .map((id, idx) => {
      const data = getBookletPrayerData(id, mysteryType);
      if (!data) return null;
      const img = isMercy
        ? (data.img || faustinaVitral)
        : resolvePrayerImage(data, mysteryType, idx);
      const imgCandidates = isMercy
        ? [data.img || faustinaVitral]
        : getPrayerImageCandidates(data, mysteryType);
      return {
        id,
        title: data.title,
        text: data.text,
        img,
        imgCandidates,
        variants: getPrayerVariants(id),
        verses: data.verses,
        sections: data.sections,
      };
    })
    .filter(Boolean);
}
