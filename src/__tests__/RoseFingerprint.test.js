import {
  DAYLIGHT_BANDS,
  createRoseFingerprint,
  daylightBandFromHour,
  daylightBandFromTimestamp,
  describeRoseContext,
  dwellCalm,
} from '../utils/roseFingerprint';
import { makeBookletRoseFingerprint } from '../utils/bookletProgress';

describe('daylight bands', () => {
  test.each([
    [0, 'madrugada'], [4, 'madrugada'],
    [5, 'amanecer'], [7, 'amanecer'],
    [9, 'manana'],
    [12, 'mediodia'], [14, 'mediodia'],
    [16, 'tarde'],
    [18, 'atardecer'], [20, 'atardecer'],
    [22, 'noche'], [23, 'noche'],
  ])('hour %i falls in %s', (hour, expected) => {
    expect(daylightBandFromHour(hour)).toBe(expected);
  });

  test('out-of-range hours wrap around the clock', () => {
    expect(daylightBandFromHour(24)).toBe('madrugada');
    expect(daylightBandFromHour(-2)).toBe('noche');
    expect(daylightBandFromHour(-9)).toBe('tarde');
  });

  test('every band id has tint deltas and a label coverage', () => {
    for (const [id, band] of Object.entries(DAYLIGHT_BANDS)) {
      expect(band.hours).toHaveLength(2);
      expect(typeof band.hue).toBe('number');
      expect(daylightBandFromHour(band.hours[0])).toBe(id);
      expect(daylightBandFromHour(band.hours[1])).toBe(id);
    }
  });

  test('timestamp maps through its hour', () => {
    const noon = new Date('2026-09-09T12:00:00').getTime();
    expect(daylightBandFromTimestamp(noon)).toBe('mediodia');
  });
});

describe('dwell calm', () => {
  test('unmeasured dwell yields null', () => {
    expect(dwellCalm(null)).toBeNull();
    expect(dwellCalm(0)).toBeNull();
    expect(dwellCalm(-5)).toBeNull();
    expect(dwellCalm(NaN)).toBeNull();
  });

  test('longer attention reads calmer, capped at half an hour', () => {
    expect(dwellCalm(5000)).toBeLessThan(dwellCalm(30000));
    expect(dwellCalm(30000)).toBeLessThan(dwellCalm(120000));
    expect(dwellCalm(30 * 60 * 1000)).toBe(1);
    expect(dwellCalm(3 * 60 * 60 * 1000)).toBe(1);
  });
});

describe('createRoseFingerprint', () => {
  test('deterministic for identical inputs', () => {
    const a = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 21000 });
    const b = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 21000 });
    expect(b).toEqual(a);
  });

  test('carries legacy fields, verseTraits and full context', () => {
    const fp = createRoseFingerprint({
      source: 'rosario', timestamp: 1725880000000, dwellMs: 45000,
      aveRun: { position: 3, total: 10 }, mysteryDecade: 2, guided: true,
    });
    expect(fp.warmthProfile).toHaveLength(12);
    expect(fp.wiggleProfile).toHaveLength(12);
    expect(fp.verseCount).toBe(10);
    expect(fp.verseTraits.warmth).toHaveLength(10);
    expect(fp.verseTraits.wiggle).toHaveLength(10);
    expect(fp.context).toMatchObject({
      source: 'rosario', daylight: daylightBandFromTimestamp(1725880000000),
      dwellMs: 45000, mysteryDecade: 2, guided: true, avePosition: 3, aveTotal: 10,
    });
  });

  test('every verse warmth stays in range and differs across verses', () => {
    const fp = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 21000 });
    fp.verseTraits.warmth.forEach(w => {
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(1);
    });
    expect(new Set(fp.verseTraits.warmth).size).toBeGreaterThan(1);
  });

  test('a different prayer moment grows a different rose', () => {
    const a = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 21000 });
    const b = createRoseFingerprint({ source: 'libro', timestamp: 1725880006000, dwellMs: 21000 });
    expect(a.verseTraits).not.toEqual(b.verseTraits);
  });

  test('longer dwell warms the ink', () => {
    const quick = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 4000 });
    const contemplative = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 120000 });
    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    expect(avg(contemplative.verseTraits.warmth)).toBeGreaterThan(avg(quick.verseTraits.warmth));
  });

  test('manual records stay calm and near-still', () => {
    const fp = createRoseFingerprint({ source: 'manual', timestamp: 1725880000000 });
    fp.verseTraits.wiggle.forEach(w => expect(w).toBeLessThan(0.3));
    const guided = createRoseFingerprint({ source: 'rosario', timestamp: 1725880000000, guided: false });
    const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    expect(avg(guided.verseTraits.wiggle)).toBeGreaterThan(avg(fp.verseTraits.wiggle));
  });

  test('dwell is capped in the stored context', () => {
    const fp = createRoseFingerprint({ source: 'libro', timestamp: 1725880000000, dwellMs: 2 * 60 * 60 * 1000 });
    expect(fp.context.dwellMs).toBe(30 * 60 * 1000);
  });
});

describe('makeBookletRoseFingerprint compatibility', () => {
  test('two-arg callers still get legacy fields plus verseTraits', () => {
    const fp = makeBookletRoseFingerprint({ position: 4, total: 10, step: 3 }, null);
    expect(fp.warmthProfile).toHaveLength(12);
    expect(fp.wiggleProfile).toHaveLength(12);
    expect(fp.verseCount).toBe(10);
    expect(fp.verseTraits.warmth).toHaveLength(10);
    expect(fp.source).toBe('libro');
  });

  test('extras carry source, dwell and guided into the context', () => {
    const fp = makeBookletRoseFingerprint({ position: 1, total: 10 }, 3, {
      source: 'rosario', timestamp: 1725880000000, dwellMs: 33000, guided: false,
    });
    expect(fp.source).toBe('rosario');
    expect(fp.context.mysteryDecade).toBe(3);
    expect(fp.context.guided).toBe(false);
  });
});

describe('describeRoseContext', () => {
  test('joins daylight, source and dwell into one label', () => {
    const noon = new Date('2026-09-09T12:30:00').getTime();
    const label = describeRoseContext(createRoseFingerprint({
      source: 'libro', timestamp: noon, dwellMs: 125000,
    }));
    expect(label).toContain('al mediodía');
    expect(label).toContain('libro');
    expect(label).toContain('2 min');
  });

  test('legacy roses without context still describe their hour', () => {
    const noon = new Date('2026-09-09T12:00:00').getTime();
    expect(describeRoseContext({ timestamp: noon })).toContain('al mediodía');
    expect(describeRoseContext(null)).toBe('');
  });
});
