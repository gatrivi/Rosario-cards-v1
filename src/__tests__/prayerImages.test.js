import {
  getPrayerImageCandidates,
  pickPrayerImage,
  resolvePrayerImage,
} from '../utils/prayerImages';
import { imagePath } from '../data/imageRegistry';

describe('prayerImages', () => {
  beforeEach(() => localStorage.clear());
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

  test('base assignment overrides the prayer image candidate', () => {
    localStorage.setItem(
      'rosario_image_assignments',
      JSON.stringify({ 'P:default': 'crux' })
    );
    const candidates = getPrayerImageCandidates({
      id: 'P',
      img: '/fallback.jpg',
    }, 'gozosos');
    expect(candidates[0]).toBe(imagePath('crux'));
  });

  test('pickPrayerImage rotates by seed', () => {
    const list = ['a', 'b', 'c'];
    expect(pickPrayerImage(list, 0)).toBe('a');
    expect(pickPrayerImage(list, 1)).toBe('b');
    expect(pickPrayerImage(list, 3)).toBe('a');
  });
});
