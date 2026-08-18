import { getRosaryReturnTarget } from '../components/Navigation/BottomNav';

describe('getRosaryReturnTarget', () => {
  test('returns the last classic rosary mystery and step', () => {
    const storage = {
      getItem: (key) => ({
        rosario_rosary_mystery: 'dolorosos',
        rosario_rosary_index: '17',
      }[key] ?? null),
    };

    expect(getRosaryReturnTarget(storage)).toEqual({
      mystery: 'dolorosos',
      step: 17,
    });
  });

  test('ignores an invalid saved step', () => {
    const storage = {
      getItem: (key) => ({
        rosario_rosary_mystery: 'gozosos',
        rosario_rosary_index: '-8',
      }[key] ?? null),
    };

    expect(getRosaryReturnTarget(storage)).toEqual({
      mystery: 'gozosos',
      step: 0,
    });
  });

  test('survives unavailable storage', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
    };

    expect(() => getRosaryReturnTarget(storage)).not.toThrow();
  });
});
