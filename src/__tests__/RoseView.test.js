import { getPrayerData, getSequenceData } from '../components/Views/roseViewHelpers';
import {
  parseMysteryText,
  resolveRoseSymbolKey,
  isMysteryStepId,
  getRoseMysteryDecade,
} from '../components/Views/roseViewHelpers';
import { getMysteryColors } from '../components/RosarioNube/utils/mysteryColors';

describe('RoseView core helpers (pure)', () => {
  test('getPrayerData returns null for unknown id', () => {
    expect(getPrayerData('NOT_REAL_ID', 'gozosos')).toBeNull();
  });

  test('getPrayerData resolves apertura/decada/mystery/cierre entries', () => {
    const sc = getPrayerData('SC', 'gozosos');
    expect(sc).toBeTruthy();
    expect(sc.id).toBe('SC');
    expect(typeof sc.title).toBe('string');

    const p = getPrayerData('P', 'gozosos');
    expect(p).toBeTruthy();
    expect(p.id).toBe('P');
  });

  test('getSequenceData builds a rosary sequence (gozosos) with key prayer ids', () => {
    const seq = getSequenceData('gozosos');
    expect(Array.isArray(seq)).toBe(true);
    expect(seq.length).toBeGreaterThan(10);

    expect(seq[0].id).toBe('SC');
    expect(seq.some((p) => p.id === 'P')).toBe(true);
    expect(seq.some((p) => p.id === 'A')).toBe(true);
    expect(seq.some((p) => p.id.startsWith('MG'))).toBe(true);
  });

  test('getSequenceData returns litany (LL) with verses and formatted strings', () => {
    const seq = getSequenceData('gozosos');
    const ll = seq.find((p) => p.id === 'LL');
    expect(ll).toBeTruthy();
    expect(Array.isArray(ll.litanyVerses)).toBe(true);
    expect(ll.litanyVerses.length).toBeGreaterThan(0);
    expect(Array.isArray(ll.versos)).toBe(true);
    expect(ll.versos.length).toBeGreaterThan(0);
    expect(typeof ll.versos[0]).toBe('string');
  });

  test('getSequenceData assigns icon/color fields', () => {
    const seq = getSequenceData('gozosos');
    const sc = seq.find((p) => p.id === 'SC');
    const p = seq.find((x) => x.id === 'P');
    expect(sc.icono).toBeTruthy();
    expect(typeof sc.color).toBe('string');
    expect(p.icono).toBeTruthy();
    expect(typeof p.color).toBe('string');
  });
});

describe('Rose mystery announcements', () => {
  test('isMysteryStepId matches MG/MD/ML + digit only', () => {
    expect(isMysteryStepId('MG1')).toBe(true);
    expect(isMysteryStepId('MD5')).toBe(true);
    expect(isMysteryStepId('ML3')).toBe(true);
    expect(isMysteryStepId('A')).toBe(false);
    expect(isMysteryStepId('LL')).toBe(false);
    expect(isMysteryStepId('P')).toBe(false);
  });

  test('getRoseMysteryDecade parses trailing digit', () => {
    expect(getRoseMysteryDecade('MG1')).toBe(1);
    expect(getRoseMysteryDecade('MD5')).toBe(5);
    expect(getRoseMysteryDecade('A')).toBeNull();
  });

  test('parseMysteryText splits meditation + citations, strips stray l lines', () => {
    const raw = 'El arcángel anuncia\nl\nCitas Escriturísticas:\n\nLucas 1:28: foo.\nLucas 1:38: bar.';
    const { meditation, citations } = parseMysteryText(raw);
    expect(meditation).toBe('El arcángel anuncia');
    expect(citations).toEqual(['Lucas 1:28: foo.', 'Lucas 1:38: bar.']);
  });

  test('parseMysteryText handles bare citation blocks (dolorosos)', () => {
    const raw = 'Lucas 22:42: foo.\n\nMateo 26:38: bar.';
    const { meditation, citations } = parseMysteryText(raw);
    expect(citations).toHaveLength(2);
    expect(meditation).toBe('Lucas 22:42: foo.');
  });

  test('parseMysteryText returns empty parts for empty input', () => {
    expect(parseMysteryText('')).toEqual({ meditation: '', citations: [] });
    expect(parseMysteryText(null)).toEqual({ meditation: '', citations: [] });
  });

  test('resolveRoseSymbolKey disambiguates gloriosos from gozosos MG ids', () => {
    expect(resolveRoseSymbolKey('MG1', 'gozosos')).toBe('gozoso_1');
    expect(resolveRoseSymbolKey('MG1', 'gloriosos')).toBe('glorioso_1');
    expect(resolveRoseSymbolKey('MD3', 'dolorosos')).toBe('doloroso_3');
    expect(resolveRoseSymbolKey('ML2', 'luminosos')).toBe('luminoso_2');
    expect(resolveRoseSymbolKey('P', 'gozosos')).toBe('bread');
    expect(resolveRoseSymbolKey('ZZZ', 'gozosos')).toBe('cross');
  });

  test('getSequenceData mystery entries carry clean titles, accents, citations', () => {
    const seq = getSequenceData('gozosos');
    const mg1 = seq.find((p) => p.id === 'MG1');
    expect(mg1.cleanTitle).toBe('La Anunciación del Ángel a María');
    expect(mg1.cleanTitle).not.toMatch(/MG1/);
    expect(mg1.meditation).toBeTruthy();
    expect(mg1.citations.length).toBeGreaterThanOrEqual(3);
    expect(mg1.decade).toBe(1);
    expect(mg1.color).toBe(getMysteryColors('gozosos').highlight);
    expect(mg1.img).toBeTruthy();
  });

  test('dolorosos mysteries use the sorrowful accent, not joyful', () => {
    const md1 = getSequenceData('dolorosos').find((p) => p.id === 'MD1');
    expect(md1.color).toBe(getMysteryColors('dolorosos').highlight);
    expect(md1.color).not.toBe(getMysteryColors('gozosos').highlight);
  });

  test('gloriosos MG1 keeps its own title despite the shared id', () => {
    const seq = getSequenceData('gloriosos');
    const mg1 = seq.find((p) => p.id === 'MG1');
    expect(mg1.cleanTitle).toBe('La Resurrección del Señor');
    expect(mg1.meditation).toBeTruthy();
  });
});

