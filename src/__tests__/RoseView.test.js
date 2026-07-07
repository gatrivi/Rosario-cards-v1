import { getPrayerData, getSequenceData } from '../components/Views/RoseView';

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

