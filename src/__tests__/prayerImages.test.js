import { getPrayerImageCandidates, resolvePrayerImage } from '../utils/prayerImages';

describe('prayerImages', () => {
  test('dolorosos mystery prefers modooscuro candidate', () => {
    const prayer = {
      id: 'MD3',
      img: '/gallery-images/misterios/misteriodolor3.jpg',
      imgmo: '/gallery-images/misterios/modooscuro/misteriodolor3.webp',
    };
    const candidates = getPrayerImageCandidates(prayer, 'dolorosos');
    expect(candidates[0]).toContain('modooscuro/misteriodolor3.webp');
    expect(resolvePrayerImage(prayer, 'dolorosos')).toContain('modooscuro');
  });
});
