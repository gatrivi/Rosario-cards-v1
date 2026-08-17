import { normalizeSharedClassicCloudState } from '../hooks/useCloudSync';

describe('classic rosary shared cloud progress', () => {
  test.each(['gozosos', 'dolorosos', 'gloriosos', 'luminosos'])(
    'keeps Libro/Rosario/Rosa on one index for %s',
    (mystery) => {
      expect(normalizeSharedClassicCloudState({
        bookletMystery: mystery,
        bookletIndex: 37,
        rosaryMystery: 'gozosos',
        rosaryIndex: 4,
      })).toMatchObject({
        bookletMystery: mystery,
        bookletIndex: 37,
        rosaryMystery: mystery,
        rosaryIndex: 37,
      });
    }
  );

  test('does not collapse independent rosary progress for non-classic Libro modes', () => {
    expect(normalizeSharedClassicCloudState({
      bookletMystery: 'divinamisericordia',
      bookletIndex: 8,
      rosaryMystery: 'gloriosos',
      rosaryIndex: 24,
    })).toMatchObject({
      bookletMystery: 'divinamisericordia',
      bookletIndex: 8,
      rosaryMystery: 'gloriosos',
      rosaryIndex: 24,
    });
  });

  test('ignores an old Rosa rosaryIndex when classic bookletIndex is canonical', () => {
    const state = normalizeSharedClassicCloudState({
      bookletMystery: 'gozosos',
      bookletIndex: 52,
      rosaryIndex: 9,
    });
    expect(state.rosaryIndex).toBe(52);
  });
});
