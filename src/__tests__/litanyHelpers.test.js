import {
  formatLitanyLine,
  getLitanySections,
  getLitanyVerse,
  getLitanyVerseCount,
  isLitanyPrayer,
  getLitanyPrayer,
} from '../utils/litanyHelpers';

describe('litanyHelpers (core)', () => {
  test('getLitanyPrayer returns LL prayer object', () => {
    const prayer = getLitanyPrayer();
    expect(prayer).toBeTruthy();
    expect(prayer.id).toBe('LL');
    expect(prayer.verses?.length || 0).toBeGreaterThan(0);
  });

  test('getLitanyVerseCount is stable and > 0', () => {
    expect(getLitanyVerseCount()).toBeGreaterThan(0);
  });

  test('getLitanyVerse clamps indices safely', () => {
    const count = getLitanyVerseCount();
    const first = getLitanyVerse(-999);
    const last = getLitanyVerse(count + 999);
    expect(first).toBeTruthy();
    expect(last).toBeTruthy();
    expect(first.invocation).toEqual(getLitanyVerse(0).invocation);
    expect(last.invocation).toEqual(getLitanyVerse(count - 1).invocation);
  });

  test('getLitanySections returns sections with start/end', () => {
    const sections = getLitanySections();
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0]).toHaveProperty('start');
    expect(sections[0]).toHaveProperty('end');
    expect(sections[0]).toHaveProperty('total');
  });

  test('formatLitanyLine formats invocation:response when different', () => {
    expect(
      formatLitanyLine({
        invocation: 'Señor, ten piedad',
        response: 'Cristo, óyenos',
      })
    ).toBe('Señor, ten piedad: Cristo, óyenos');
  });

  test('formatLitanyLine falls back to response', () => {
    expect(formatLitanyLine({ response: 'Ten piedad de nosotros' })).toBe('Ten piedad de nosotros');
  });

  test('isLitanyPrayer recognizes LL with verses', () => {
    const prayer = getLitanyPrayer();
    expect(isLitanyPrayer(prayer)).toBe(true);
    // Helper falls back to litanyLauretanaVerses presence (global LL data).
    expect(isLitanyPrayer({ id: 'LL', verses: [] })).toBe(true);
    expect(isLitanyPrayer({ id: 'P', verses: [1, 2, 3] })).toBe(false);
  });

  test('isLitanyPrayer recognizes type litany with verses', () => {
    expect(
      isLitanyPrayer({
        id: 'SCA_LITANY',
        type: 'litany',
        verses: [{ invocation: 'Corazón de Jesús', response: 'Te rogamos, óyenos.' }],
      })
    ).toBe(true);
    expect(isLitanyPrayer({ id: 'SCA_LITANY', type: 'litany', verses: [] })).toBe(false);
  });
});

