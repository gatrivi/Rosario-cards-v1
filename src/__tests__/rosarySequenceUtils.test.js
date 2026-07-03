import { buildSequence } from '../utils/bookletSequence';
import { isClosingPrayersUnlocked } from '../utils/rosarySequenceUtils';

describe('isClosingPrayersUnlocked', () => {
  test('locked at opening, unlocked near litany', () => {
    const seq = buildSequence('dolorosos');
    expect(isClosingPrayersUnlocked(seq, 0)).toBe(false);
    const llIdx = seq.findIndex((p) => p.id === 'LL');
    expect(llIdx).toBeGreaterThan(0);
    expect(isClosingPrayersUnlocked(seq, llIdx - 1)).toBe(true);
  });

  test('unlocked after fifth mystery', () => {
    const seq = buildSequence('gozosos');
    const fifthMystery = seq.findIndex((p) => p.id === 'MG5');
    expect(fifthMystery).toBeGreaterThan(0);
    expect(isClosingPrayersUnlocked(seq, fifthMystery)).toBe(true);
  });
});
