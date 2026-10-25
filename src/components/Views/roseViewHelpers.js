/**
 * Pure data helpers extracted from RoseView.jsx so utils and tests can import
 * them without pulling a View component into the module graph.
 */
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { OPTIONAL_PRAYERS } from '../../data/optionalPrayers';
import { RDM_KEYS, divineMercyPrayers, resolveMercyStepImage } from '../../data/divineMercyData';
import { formatLitanyLine } from '../../utils/litanyHelpers';
import { resolveLitanyVerseImage } from '../../utils/prayerImages';
import { cleanPrayerDisplayTitle } from '../../utils/speakablePrayerText';
import { SYMBOL_MAP } from '../../data/SacredSymbols';
import { getMysteryColors } from '../RosarioNube/utils/mysteryColors';

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

export const MYSTERY_ORDINALS = {
  1: 'Primer', 2: 'Segundo', 3: 'Tercer', 4: 'Cuarto', 5: 'Quinto',
};

export const MYSTERY_SET_NAMES = {
  gozosos: 'Gozosos',
  dolorosos: 'Dolorosos',
  gloriosos: 'Gloriosos',
  luminosos: 'Luminosos',
};

/** True for mystery announcement steps (MG1-5, MD1-5, ML1-5). */
export const isMysteryStepId = (id) => /^M[A-Z]*\d$/.test(String(id || ''));

/** Decade number from ids like MG1, MD3, ML5 (null when not a mystery). */
export const getRoseMysteryDecade = (id) => {
  const match = String(id || '').match(/(\d)$/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Split a mystery `text` into a short meditation + scripture citations.
 * Gozosos/Gloriosos carry a "Citas Escriturísticas:" header; Dolorosos and
 * Luminosos are bare citation paragraphs (first doubles as meditation).
 * Also strips the stray single-"l" artifact lines present in the source data.
 */
export const parseMysteryText = (rawText = '') => {
  const cleaned = String(rawText || '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length === 0 || line.toLowerCase() !== 'l')
    .join('\n');
  const headerMatch = cleaned.match(/Citas Escriturísticas:/i);
  if (!headerMatch) {
    const paras = cleaned.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (!paras.length) return { meditation: '', citations: [] };
    return { meditation: paras[0], citations: paras };
  }
  const meditation = cleaned
    .slice(0, headerMatch.index)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const citations = cleaned
    .slice(headerMatch.index + headerMatch[0].length)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { meditation, citations };
};

/**
 * SacredDrawing symbol for a Rose step. Gloriosos reuse the MG1-5 ids of
 * Gozosos, so the mystery set (not the id alone) decides the drawing.
 */
export const resolveRoseSymbolKey = (prayerId = '', mysteryType = 'gozosos') => {
  const id = String(prayerId || '');
  if (id.startsWith('MG')) {
    const num = id.slice(2);
    if (mysteryType === 'gloriosos') return `glorioso_${num}`;
    return `gozoso_${num}`;
  }
  if (id.startsWith('MD')) return `doloroso_${id.slice(2)}`;
  if (id.startsWith('ML')) return `luminoso_${id.slice(2)}`;
  return SYMBOL_MAP[id] || 'cross';
};

const splitVersos = (text = '') =>
  String(text).split(/(?<=[.,;:!])\s+|\n+/).map(v => v.trim()).filter(v => v.length > 0);

/** Devotions prayed in the Rosa via /rosa?devocion=<id>. They never count roses. */
export const ROSE_DEVOTION_MISERICORDIA = 'misericordia';
export const ROSE_DEVOTIONS = ['patrick', ROSE_DEVOTION_MISERICORDIA];
export const isRoseDevotion = (id) => ROSE_DEVOTIONS.includes(id);

const MERCY_STEP_STYLE = {
  EF: { icono: '🩸', color: '#B22222' },
  MP: { icono: '❤️', color: '#C0392B' },
  HG: { icono: '✨', color: '#D4AF37' },
  DMO1: { icono: '💧', color: '#7FB3D5' },
  DMO2: { icono: '💧', color: '#7FB3D5' },
};

/** Full Divine Mercy chaplet (Santa Faustina) as Rosa steps, one per bead. */
const getMercyChapletSequence = () => {
  const partial = RDM_KEYS
    .map(id => divineMercyPrayers.find(p => p.id === id) || getPrayerData(id))
    .filter(Boolean);
  return partial.map((data, sequenceIndex) => {
    const img = resolveMercyStepImage(data.id, { sequenceIndex, sequence: partial });
    const style = MERCY_STEP_STYLE[data.id] || { icono: '🙏', color: '#B8860B' };
    return {
      id: data.id,
      title: data.title,
      ...style,
      versos: splitVersos(data.text),
      img,
      imgCandidates: [img],
    };
  });
};

export const getSequenceData = (mysteryType = 'gozosos', devotion) => {
  if (devotion === ROSE_DEVOTION_MISERICORDIA) return getMercyChapletSequence();
  if (devotion === 'patrick') {
    const prayer = OPTIONAL_PRAYERS.find(p => p.id === 'patrick');
    return [{
      id: 'PATRICK', title: prayer.title, icono: '✝', color: '#59b88e',
      img: prayer.img, imgCandidates: prayer.imgCandidates,
      versos: prayer.variants.find(v => v.id === 'es').text.split(/\n+/).filter(Boolean),
    }];
  }
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

    const versos = splitVersos(rawData.text);

    if (isMysteryStepId(id)) {
      // Mystery announcements are contemplated, not hold-prayed: expose a
      // clean title, per-set accent color, meditation + citations separately.
      const { meditation, citations } = parseMysteryText(rawData.text || '');
      const accent = getMysteryColors(mysteryType)?.highlight || color;
      return {
        id,
        title: rawData.title,
        cleanTitle: cleanPrayerDisplayTitle(rawData.title),
        icono,
        color: accent,
        versos,
        meditation,
        citations,
        decade: getRoseMysteryDecade(id),
        img: rawData.imgmo || rawData.img,
        imgmo: rawData.imgmo,
      };
    }

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
