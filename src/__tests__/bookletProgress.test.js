import {
  countAvesBefore,
  getBookletStepContext,
  getMysteryDecadeNumber,
  stepContextToVitralVars,
} from '../utils/bookletProgress';

describe('bookletProgress', () => {
  const sequence = [
    { id: 'SC' },
    { id: 'P' },
    { id: 'A' },
    { id: 'A' },
    { id: 'G' },
    { id: 'MG1' },
    { id: 'P' },
    ...Array.from({ length: 10 }, () => ({ id: 'A' })),
  ];

  test('countAvesBefore', () => {
    expect(countAvesBefore(sequence, 0)).toBe(0);
    expect(countAvesBefore(sequence, 4)).toBe(2);
    expect(countAvesBefore(sequence, 8)).toBe(3);
    expect(countAvesBefore(sequence, 10)).toBe(5);
  });

  test('getMysteryDecadeNumber', () => {
    expect(getMysteryDecadeNumber('MG3')).toBe(3);
    expect(getMysteryDecadeNumber('MD5')).toBe(5);
    expect(getMysteryDecadeNumber('A')).toBeNull();
  });

  test('ave step context', () => {
    const ctx = getBookletStepContext(sequence, 9, sequence.length);
    expect(ctx.kind).toBe('ave');
    expect(ctx.aveRun).toEqual({ position: 3, total: 10, step: 2 });
  });

  test('mystery step context', () => {
    const ctx = getBookletStepContext(sequence, 5, sequence.length);
    expect(ctx.kind).toBe('mystery');
    expect(ctx.mysteryDecade).toBe(1);
  });

  test('vitral vars grow with progress', () => {
    const early = stepContextToVitralVars(getBookletStepContext(sequence, 2, sequence.length));
    const late = stepContextToVitralVars(
      getBookletStepContext(sequence, sequence.length - 1, sequence.length)
    );
    expect(parseFloat(late['--ave-zoom'])).toBeGreaterThan(parseFloat(early['--ave-zoom']));
  });
});
