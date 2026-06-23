import { buildSequence } from '../utils/bookletSequence';
import { getBookletStepContext } from '../utils/bookletProgress';

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

  test('rosary mysteries unchanged', () => {
    const goz = buildSequence('gozosos');
    expect(goz.length).toBeGreaterThan(60);
    expect(goz.some((p) => p.id === 'MG1')).toBe(true);
    expect(goz.some((p) => p.id === 'MP')).toBe(false);
  });
});
