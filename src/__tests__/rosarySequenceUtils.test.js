import { buildSequence } from '../utils/bookletSequence';
import { canStartLitany, isClosingPrayersUnlocked } from '../utils/rosarySequenceUtils';

describe('isClosingPrayersUnlocked', () => {
  test('locked at opening and mid-rosary, unlocked near litany', () => {
    const seq = buildSequence('dolorosos');
    expect(isClosingPrayersUnlocked(seq, 0)).toBe(false);
    const llIdx = seq.findIndex((p) => p.id === 'LL');
    expect(llIdx).toBeGreaterThan(0);
    const fifthMystery = seq.findIndex((p) => p.id === 'MD5');
    expect(isClosingPrayersUnlocked(seq, fifthMystery)).toBe(false);
    expect(isClosingPrayersUnlocked(seq, llIdx - 2)).toBe(false);
    expect(isClosingPrayersUnlocked(seq, llIdx - 1)).toBe(true);
  });
});

describe('canStartLitany', () => {
  test('heart medal may enter litany only from closing Fatima, not Salve', () => {
    const seq = buildSequence('gozosos');
    const llIdx = seq.findIndex((p) => p.id === 'LL');
    const salveIdx = seq.findIndex((p) => p.id === 'S');
    expect(canStartLitany(seq, llIdx - 1)).toBe(true);
    expect(canStartLitany(seq, llIdx)).toBe(true);
    expect(canStartLitany(seq, salveIdx)).toBe(false);
    expect(canStartLitany(seq, 0)).toBe(false);
  });
});
