import {
  ROSARY_MYSTERY_IDS,
  getNextRosaryMystery,
  isValidRosaryMystery,
} from '../utils/bookletSequence';

describe('getNextRosaryMystery (four vias)', () => {
  test('cycles gozosos → dolorosos → gloriosos → luminosos → gozosos', () => {
    expect(getNextRosaryMystery('gozosos')).toBe('dolorosos');
    expect(getNextRosaryMystery('dolorosos')).toBe('gloriosos');
    expect(getNextRosaryMystery('gloriosos')).toBe('luminosos');
    expect(getNextRosaryMystery('luminosos')).toBe('gozosos');
  });

  test('non-rosary returns null', () => {
    expect(getNextRosaryMystery('angelus')).toBe(null);
    expect(getNextRosaryMystery('viacrucis')).toBe(null);
  });

  test('four-via auto stop: wrap equals start after 4 hops', () => {
    const start = 'gloriosos';
    let cur = start;
    const seen = [cur];
    for (let i = 0; i < 3; i += 1) {
      cur = getNextRosaryMystery(cur);
      seen.push(cur);
      expect(cur).not.toBe(start);
    }
    expect(getNextRosaryMystery(cur)).toBe(start);
    expect(seen).toEqual(['gloriosos', 'luminosos', 'gozosos', 'dolorosos']);
    expect(ROSARY_MYSTERY_IDS.every(isValidRosaryMystery)).toBe(true);
  });
});
