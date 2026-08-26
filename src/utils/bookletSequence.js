import RosarioPrayerBook from '../data/RosarioPrayerBook';
import { getPrayerData } from '../components/Views/roseViewHelpers';
import { getPrayerVariants } from '../data/prayerVariants';
import {
  getPrayerImageCandidates,
  resolvePrayerImage,
} from './prayerImages';
import {
  DIVINE_MERCY_ID,
  RDM_KEYS,
  resolveMercyStepImage,
} from '../data/divineMercyData';
import { divineMercyNovenaDays } from '../data/divineMercyNovenaData';
import {
  MARIAN_DEVOTION_IDS,
  buildMarianDevotionSequence,
  isMarianDevotionMode as isMarianDevotionDataMode,
} from '../data/marianDevotionsData';
import {
  preciousBloodLitanyMeta,
  preciousBloodLitanyVerses,
  preciousBloodLitanySections,
  preciousBloodLitanyClosingPrayer,
  PRECIOUS_BLOOD_CHAPLET_KEYS,
  preciousBloodChapletPrayers,
  preciousBloodSevenSheddings,
  preciousBloodSevenOfferings,
} from '../data/preciousBloodData';
import { buildViaCrucisSequence, buildViaLucisSequence, buildViaCrucisRosarioSequence } from '../data/viaCrucisData';
import {
  SAGRADO_CORAZON_ADORACION_ID,
  getSagradoCorazonAdoracionSequence,
  isSagradoCorazonAdoracionMode as isSagradoCorazonAdoracionDataMode,
} from '../data/sagradoCorazonAdoracionData';

export { isSagradoCorazonAdoracionMode } from '../data/sagradoCorazonAdoracionData';

export const PRECIOUS_BLOOD_MODES = new Set([
  'sangrepreciosa_litany',
  'sangrepreciosa_chaplet',
  'sangrepreciosa_ofrendas',
]);

export function isPreciousBloodMode(mysteryType) {
  return PRECIOUS_BLOOD_MODES.has(mysteryType);
}

const SC_TEXT_PB =
  'Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro. En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.';

function buildPreciousBloodSequence(mysteryType) {
  const sc = {
    id: 'SC',
    title: 'Señal de la Cruz',
    text: SC_TEXT_PB,
    img: preciousBloodLitanyMeta.img,
    imgCandidates: [preciousBloodLitanyMeta.img],
  };

  if (mysteryType === 'sangrepreciosa_litany') {
    const verseSteps = preciousBloodLitanyVerses.map((v, i) => ({
      id: `LPB_${i + 1}`,
      title: `Letanía — ${v.invocation.slice(0, 40)}`,
      text:
        v.invocation === v.response
          ? v.invocation
          : `${v.invocation}\n— ${v.response}`,
      img: v.img,
      imgCandidates: [v.img],
    }));
    const closing = {
      id: 'LPB_Close',
      title: 'Oración final',
      text: preciousBloodLitanyClosingPrayer,
      img: preciousBloodLitanyMeta.imgmo,
      imgCandidates: [preciousBloodLitanyMeta.imgmo],
    };
    if (verseSteps[0]) {
      verseSteps[0].verses = preciousBloodLitanyVerses;
      verseSteps[0].sections = preciousBloodLitanySections;
    }
    return [sc, ...verseSteps, closing];
  }

  if (mysteryType === 'sangrepreciosa_chaplet') {
    const byId = Object.fromEntries(preciousBloodChapletPrayers.map((p) => [p.id, p]));
    return PRECIOUS_BLOOD_CHAPLET_KEYS.map((id, idx) => {
      const data = byId[id];
      if (!data) return null;
      let title = data.title;
      if (id === 'PB_P') {
        const group = Math.floor(idx / 7);
        const shedding = preciousBloodSevenSheddings[group] || preciousBloodSevenSheddings[0];
        title = `${data.title} — ${shedding.title}`;
      }
      return {
        id: `${id}_${idx}`,
        title,
        text: data.text,
        img: data.img,
        imgCandidates: [data.img],
      };
    }).filter(Boolean);
  }

  if (mysteryType === 'sangrepreciosa_ofrendas') {
    const offerings = preciousBloodSevenOfferings.map((o) => ({
      id: `PBO_${o.num}`,
      title: o.title,
      text: o.text,
      img: o.img,
      imgCandidates: [o.img],
    }));
    return [sc, ...offerings];
  }

  return [];
}

export const ROSARY_MYSTERY_IDS = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'];
export const ROSARY_MYSTERIES = new Set(ROSARY_MYSTERY_IDS);

/** Libro devotions — standard mysteries plus chaplets / novenas in BookletView. */
export const BOOKLET_MYSTERY_IDS = [
  ...ROSARY_MYSTERY_IDS,
  DIVINE_MERCY_ID,
  'divinamisericordia_novena',
  ...MARIAN_DEVOTION_IDS,
  ...PRECIOUS_BLOOD_MODES,
  'viacrucis',
  'viacrucis_rosario',
  'vialucis',
  SAGRADO_CORAZON_ADORACION_ID,
];
export const BOOKLET_MYSTERIES = new Set(BOOKLET_MYSTERY_IDS);

export function isValidBookletMystery(id) {
  return BOOKLET_MYSTERIES.has(id);
}

export function isValidRosaryMystery(id) {
  return ROSARY_MYSTERIES.has(id);
}

/** Next via in gozosos → dolorosos → gloriosos → luminosos → gozosos. */
export function getNextRosaryMystery(id) {
  const i = ROSARY_MYSTERY_IDS.indexOf(id);
  if (i < 0) return null;
  return ROSARY_MYSTERY_IDS[(i + 1) % ROSARY_MYSTERY_IDS.length];
}

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
  return misterioActual === DIVINE_MERCY_ID || misterioActual === 'divinamisericordia_novena';
}

export function isStationsDevotion(misterioActual) {
  return (
    misterioActual === 'viacrucis' ||
    misterioActual === 'viacrucis_rosario' ||
    misterioActual === 'vialucis'
  );
}

export function isMarianDevotionMode(misterioActual) {
  return isMarianDevotionDataMode(misterioActual);
}

/** Libro-only lookup — keeps chaplet data out of RoseView.getPrayerData. */
function getBookletPrayerData(id, mysteryType, novenaDay = 1) {
  if (mysteryType === DIVINE_MERCY_ID || mysteryType === 'divinamisericordia_novena') {
    if (id === 'NOVENA_DAY_INTENTION') {
      const dayData = divineMercyNovenaDays.find((d) => d.day === novenaDay) || divineMercyNovenaDays[0];
      return {
        id: 'NOVENA_DAY_INTENTION',
        title: dayData.intentionTitle,
        text: `${dayData.intentionText}\n\n${dayData.closingInstruction}`,
        img: dayData.img,
      };
    }
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
  if (mysteryType === 'divinamisericordia_novena') {
    // SC -> NOVENA_DAY_INTENTION -> [optional: DMO1 -> DMO2] -> P -> A -> C -> (EF + MPx10)x5 -> HGx3
    // RDM_KEYS is: SC, DMO1, DMO2, P, A, C, DECADES, HG, HG, HG
    const baseChaplet = RDM_KEYS.filter((id) => id !== 'SC' && id !== 'DMO1' && id !== 'DMO2');
    if (includeMercyOpening) {
      return ['SC', 'NOVENA_DAY_INTENTION', 'DMO1', 'DMO2', ...baseChaplet];
    }
    return ['SC', 'NOVENA_DAY_INTENTION', ...baseChaplet];
  }
  return RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
}

export function buildSequence(mysteryType, options = {}) {
  const { includeMercyOpening = true, novenaDay = 1 } = options;

  if (isPreciousBloodMode(mysteryType)) {
    return buildPreciousBloodSequence(mysteryType);
  }
  if (isMarianDevotionMode(mysteryType)) {
    return buildMarianDevotionSequence(mysteryType);
  }
  if (mysteryType === 'viacrucis') return buildViaCrucisSequence();
  if (mysteryType === 'viacrucis_rosario') return buildViaCrucisRosarioSequence();
  if (mysteryType === 'vialucis') return buildViaLucisSequence();
  if (isSagradoCorazonAdoracionDataMode(mysteryType)) {
    return getSagradoCorazonAdoracionSequence();
  }

  const keys = getSequenceKeys(mysteryType, includeMercyOpening);
  const isMercy = mysteryType === DIVINE_MERCY_ID || mysteryType === 'divinamisericordia_novena';

  const partial = keys
    .map((id) => getBookletPrayerData(id, mysteryType, novenaDay))
    .filter(Boolean);

  return partial
    .map((data, idx) => {
      const imgCandidates = isMercy
        ? [
            resolveMercyStepImage(data.id, {
              sequenceIndex: idx,
              sequence: partial,
              novenaDay,
            }),
          ].filter(Boolean)
        : getPrayerImageCandidates(data, mysteryType);
      // Always prefer candidates[0] — never rotate primary by sequence index
      // (that made P/LL/S land on the cathedral fallback).
      const img = imgCandidates[0] || resolvePrayerImage(data, mysteryType, 0);
      return {
        id: data.id,
        title: data.title,
        text: data.text,
        img,
        imgCandidates,
        variants: getPrayerVariants(data.id),
        verses: data.verses,
        sections: data.sections,
      };
    });
}
