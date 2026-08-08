import {
  getPrayerImageCandidates,
  pickPrayerImage,
  resolvePrayerImage,
} from '../utils/prayerImages';
import {
  imagePath,
  isTextHeavyImageId,
  isTextHeavyImagePath,
} from '../data/imageRegistry';

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
      JSON.stringify({ 'P:default': 'vitreauxCruz' })
    );
    const candidates = getPrayerImageCandidates({
      id: 'P',
      img: '/fallback.jpg',
    }, 'gozosos');
    expect(candidates[0]).toBe(imagePath('vitreauxCruz'));
  });

  test('text-heavy assignment is ignored for Liber backgrounds', () => {
    expect(isTextHeavyImageId('crux')).toBe(true);
    localStorage.setItem(
      'rosario_image_assignments',
      JSON.stringify({ 'P:default': 'crux' })
    );
    const candidates = getPrayerImageCandidates({
      id: 'P',
      img: '/fallback.jpg',
    }, 'gozosos');
    expect(candidates).not.toContain(imagePath('crux'));
    expect(candidates[0]).toBe('/fallback.jpg');
  });

  test('pickPrayerImage rotates by seed', () => {
    const list = ['a', 'b', 'c'];
    expect(pickPrayerImage(list, 0)).toBe('a');
    expect(pickPrayerImage(list, 1)).toBe('b');
    expect(pickPrayerImage(list, 3)).toBe('a');
  });
});

describe('text-heavy image registry', () => {
  test('handwritten plates are flagged', () => {
    expect(isTextHeavyImageId('latinGloria')).toBe(true);
    expect(isTextHeavyImageId('reginaCaeli')).toBe(true);
    expect(isTextHeavyImagePath(imagePath('latinAngelus'))).toBe(true);
    expect(isTextHeavyImageId('stainedGlass')).toBe(false);
  });
});
