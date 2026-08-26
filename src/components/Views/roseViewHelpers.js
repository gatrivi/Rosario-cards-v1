/**
 * Pure data helpers extracted from RoseView.jsx so utils and tests can import
 * them without pulling a View component into the module graph.
 */
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { formatLitanyLine } from '../../utils/litanyHelpers';
import { resolveLitanyVerseImage } from '../../utils/prayerImages';

export const getPrayerData = (id, mysteryType = 'gozosos') => {
  const apertura = RosarioPrayerBook.apertura.find(p => p.id === id);
  if (apertura) return apertura;
  const decada = RosarioPrayerBook.decada.find(p => p.id === id);
  if (decada) return decada;
  const mystery = RosarioPrayerBook.mysteries[mysteryType]?.find(p => p && p.id === id);
  if (mystery) return mystery;
  const cierre = RosarioPrayerBook.cierre.find(p => p.id === id);
  if (cierre) return cierre;
  return null;
};

export const getSequenceData = (mysteryType = 'gozosos') => {
  const seqMap = { 'gozosos': 'RGo', 'dolorosos': 'RDo', 'gloriosos': 'RGl', 'luminosos': 'RL' };
  const sequenceKeys = RosarioPrayerBook[seqMap[mysteryType]] || RosarioPrayerBook.RGo;

  return sequenceKeys.map(id => {
    const rawData = getPrayerData(id, mysteryType);
    if (!rawData) return null;
    let icono = '🙏'; let color = '#808080';
    if (id === 'P') { icono = '✝️'; color = '#B8860B'; }
    else if (id === 'A') { icono = '🌹'; color = '#8B0000'; }
    else if (id === 'G') { icono = '🌟'; color = '#FFD700'; }
    else if (id === 'F') { icono = '🔥'; color = '#FF4500'; }
    else if (id.startsWith('M')) { icono = '📖'; color = '#4682B4'; }
    else if (id === 'LL' || id === 'S') { icono = '👑'; color = '#800080'; }

    if (id === 'LL' && rawData.verses?.length) {
      const verseImages = rawData.verses.map((v, i) => resolveLitanyVerseImage(v, rawData, i));
      const versos = rawData.verses.map(formatLitanyLine);
      return {
        id,
        title: rawData.title,
        icono,
        color,
        versos,
        img: rawData.imgmo || rawData.img,
        imgmo: rawData.imgmo,
        verseImages,
        litanyVerses: rawData.verses,
        litanySections: rawData.sections,
      };
    }

    const versos = rawData.text.split(/(?<=[.,;:!])\s+|\n+/).map(v => v.trim()).filter(v => v.length > 0);
    return {
      id,
      title: rawData.title,
      icono,
      color,
      versos,
      img: rawData.imgmo || rawData.img,
      imgmo: rawData.imgmo,
    };
  }).filter(Boolean);
};

// Word-level reading pace — no longer character-based speeds.
// Each verse enforces a minimum total duration regardless of word count.
// Module-level constant: the hold-to-pray effect depends on currentRhythm;
// recreating this object every render made that effect tear down its own
// timer on every warmth-tick re-render, so holding never advanced words.
export const RHYTHM_CONFIG = {
  'oro':      { minVerseMs: 3000, minWordMs: 250 }, // Fast/Focus
  'incienso': { minVerseMs: 5000, minWordMs: 400 }, // Standard/Contemplative
  'mirra':    { minVerseMs: 8000, minWordMs: 600 }, // Slow/Deep
};
