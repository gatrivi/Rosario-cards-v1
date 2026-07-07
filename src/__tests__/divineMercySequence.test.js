import { buildSequence, isValidBookletMystery, isValidRosaryMystery } from '../utils/bookletSequence';
import { getBookletStepContext } from '../utils/bookletProgress';
import { angelusThumbnail, magnificatThumbnail } from '../data/marianDevotionsData';

describe('divineMercySequence', () => {
  test('64 steps with optional opening', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: true });
    expect(seq).toHaveLength(64);
    expect(seq[0].id).toBe('SC');
    expect(seq[1].id).toBe('DMO1');
    expect(seq[2].id).toBe('DMO2');
    expect(seq[seq.length - 1].id).toBe('HG');
  });

  test('62 steps without optional opening', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: false });
    expect(seq).toHaveLength(62);
    expect(seq.map((p) => p.id)).not.toContain('DMO1');
    expect(seq.map((p) => p.id)).not.toContain('DMO2');
  });

  test('MP run shows N de 10', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: false });
    const mpStart = seq.findIndex((p) => p.id === 'MP');
    const ctx = getBookletStepContext(seq, mpStart + 4, seq.length);
    expect(ctx.mercyRun).toEqual({ position: 5, total: 10, step: 4 });
  });

  test('EF shows década N de 5', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: false });
    const secondEf = seq.map((p) => p.id).indexOf('EF', seq.map((p) => p.id).indexOf('EF') + 1);
    const ctx = getBookletStepContext(seq, secondEf, seq.length);
    expect(ctx.kind).toBe('decade');
    expect(ctx.mysteryDecade).toBe(2);
  });

  test('HG shows N de 3', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: false });
    const hgStart = seq.findIndex((p) => p.id === 'HG');
    const ctx = getBookletStepContext(seq, hgStart + 1, seq.length);
    expect(ctx.tripletRun).toEqual({ position: 2, total: 3, step: 1 });
  });

  test('each mercy prayer type has a distinct vitral', () => {
    const seq = buildSequence('divinamisericordia', { includeMercyOpening: true });
    const sc = seq.find((p) => p.id === 'SC');
    const dmo1 = seq.find((p) => p.id === 'DMO1');
    const p = seq.find((p) => p.id === 'P');
    const mpFirst = seq.find((p) => p.id === 'MP');
    const mpDecade2 = seq.filter((p) => p.id === 'MP')[10];
    const hgFirst = seq.find((p) => p.id === 'HG');
    const hgSecond = seq.filter((p) => p.id === 'HG')[1];

    expect(sc?.img).toBeTruthy();
    expect(dmo1?.img).toBeTruthy();
    expect(p?.img).toBeTruthy();
    expect(sc.img).not.toBe(dmo1.img);
    expect(mpFirst?.img).toBeTruthy();
    expect(mpDecade2?.img).toBeTruthy();
    expect(mpFirst.img).not.toBe(mpDecade2.img);
    expect(hgFirst?.img).not.toBe(hgSecond?.img);
  });

  test('rosary mysteries unchanged', () => {
    const goz = buildSequence('gozosos');
    expect(goz.length).toBeGreaterThan(60);
    expect(goz.some((p) => p.id === 'MG1')).toBe(true);
    expect(goz.some((p) => p.id === 'MP')).toBe(false);
  });

  test('booklet mystery validation', () => {
    expect(isValidRosaryMystery('gozosos')).toBe(true);
    expect(isValidRosaryMystery('divinamisericordia')).toBe(false);
    expect(isValidBookletMystery('divinamisericordia')).toBe(true);
    expect(isValidBookletMystery('divinamisericordia_novena')).toBe(true);
    expect(isValidBookletMystery('sangrepreciosa_litany')).toBe(true);
    expect(isValidBookletMystery('viacrucis')).toBe(true);
    expect(isValidBookletMystery('vialucis')).toBe(true);
    expect(isValidBookletMystery('angelus')).toBe(true);
    expect(isValidBookletMystery('magnificat')).toBe(true);
    expect(isValidRosaryMystery('angelus')).toBe(false);
    expect(isValidBookletMystery('bogus')).toBe(false);
  });

  test('marian devotions are booklet-only and visually distinct', () => {
    const angelus = buildSequence('angelus');
    const magnificat = buildSequence('magnificat');
    expect(angelus.map((p) => p.id)).toEqual([
      'ANG_SC',
      'ANG_ANNUNCIATION',
      'ANG_AVE_1',
      'ANG_FIAT',
      'ANG_AVE_2',
      'ANG_INCARNATION',
      'ANG_AVE_3',
      'ANG_FINAL',
    ]);
    expect(magnificat).toHaveLength(9);
    expect(angelus.map((p) => p.id)).not.toContain('A');
    expect(angelus[0].img).toBeTruthy();
    expect(magnificat[0].img).toBeTruthy();
    expect(angelusThumbnail).toBeTruthy();
    expect(magnificatThumbnail).toBeTruthy();
    expect(angelusThumbnail).not.toBe(magnificatThumbnail);
  });

  test('via crucis has 15 steps', () => {
    const seq = buildSequence('viacrucis');
    expect(seq).toHaveLength(15);
    expect(seq[0].id).toBe('VC_OPEN');
    expect(seq[14].id).toBe('VC_14');
  });

  test('via stations have distinct meditations', () => {
    const crucis = buildSequence('viacrucis');
    const lucis = buildSequence('vialucis');
    const cTexts = crucis.slice(1).map((s) => s.text);
    const lTexts = lucis.slice(1).map((s) => s.text);
    expect(new Set(cTexts).size).toBe(14);
    expect(new Set(lTexts).size).toBe(14);
    expect(cTexts[0]).toMatch(/Pilato|inocente/i);
    expect(lTexts[0]).toMatch(/resucit|sepulcro/i);
  });
});
