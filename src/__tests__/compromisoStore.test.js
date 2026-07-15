import {
  isFullRosarioComplete,
  tryFulfillCompromiso,
  saveCompromiso,
  loadCompromiso,
  COMPROMISO_HEADLINE,
  getCompromisoShareText,
} from '../utils/compromisoStore';
import { isClosingPrayersUnlocked } from '../utils/rosarySequenceUtils';

/** Minimal classic rosary stub: 5 mysteries + closing G/F/LL. */
function makeClassicSeq() {
  return [
    { id: 'SC' },
    { id: 'P' },
    { id: 'MG1' },
    { id: 'P' },
    { id: 'A' },
    { id: 'G' },
    { id: 'F' },
    { id: 'MG2' },
    { id: 'P' },
    { id: 'A' },
    { id: 'G' },
    { id: 'F' },
    { id: 'MG3' },
    { id: 'P' },
    { id: 'A' },
    { id: 'G' },
    { id: 'F' },
    { id: 'MG4' },
    { id: 'P' },
    { id: 'A' },
    { id: 'G' },
    { id: 'F' },
    { id: 'MG5' },
    { id: 'P' },
    { id: 'A' },
    { id: 'G' },
    { id: 'F' },
    { id: 'LL' },
    { id: 'S' },
  ];
}

describe('compromisoStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('one decade (early index) does not fulfill', () => {
    saveCompromiso({ mysteryId: 'gozosos' });
    const seq = makeClassicSeq();
    expect(isClosingPrayersUnlocked(seq, 6)).toBe(false);
    expect(isFullRosarioComplete(seq, 6, 'gozosos', 1)).toBe(false);
    expect(tryFulfillCompromiso(seq, 6, 'gozosos', 1)).toBeNull();
  });

  test('closing unlock without 5 décenas does not fulfill', () => {
    saveCompromiso({ mysteryId: 'dolorosos' });
    const seq = makeClassicSeq();
    const unlockIdx = seq.findIndex((s) => s.id === 'LL') - 1;
    expect(isFullRosarioComplete(seq, unlockIdx, 'dolorosos', 0)).toBe(false);
    expect(tryFulfillCompromiso(seq, unlockIdx, 'dolorosos', null)).toBeNull();
  });

  test('5 décenas + closing unlock fulfills', () => {
    saveCompromiso({ mysteryId: 'dolorosos' });
    const seq = makeClassicSeq();
    const unlockIdx = seq.findIndex((s) => s.id === 'LL') - 1;
    expect(tryFulfillCompromiso(seq, unlockIdx, 'dolorosos', 5)).toBeTruthy();
    expect(loadCompromiso().status).toBe('fulfilled');
  });

  test('non-classic mystery never fulfills', () => {
    saveCompromiso({ mysteryId: 'gozosos' });
    const seq = makeClassicSeq();
    const unlockIdx = seq.findIndex((s) => s.id === 'LL') - 1;
    expect(isFullRosarioComplete(seq, unlockIdx, 'divinamisericordia', 5)).toBe(false);
  });

  test('share text uses Ya recé orthography', () => {
    const text = getCompromisoShareText({ fulfilled: true });
    expect(text).toMatch(/Ya recé/);
    expect(text).not.toMatch(/rezé/i);
    expect(COMPROMISO_HEADLINE).toBe('Rezá por Argentina');
  });
});
