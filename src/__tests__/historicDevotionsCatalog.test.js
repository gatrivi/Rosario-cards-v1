jest.mock('../data/imageRegistry', () => ({
  imagePath: (id) => `/mock/${id}.jpg`,
}));

import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';
import {
  HISTORIC_DEVOTIONS,
  upcomingDevotionThumbs,
} from '../data/historicDevotionsCatalog';

describe('historic devoutions + San Miguel', () => {
  test('catalog marks have vs soon; upcoming thumbs have art urls', () => {
    expect(HISTORIC_DEVOTIONS.some((d) => d.status === 'have')).toBe(true);
    const soon = upcomingDevotionThumbs();
    expect(soon.length).toBeGreaterThanOrEqual(4);
    soon.forEach((d) => {
      expect(d.img).toMatch(/^\/mock\//);
      expect(d.status).toBe('soon');
    });
  });

  test('San Miguel optional prayer ships with text variants', () => {
    const m = OPTIONAL_PRAYERS.find((p) => p.id === 'michael');
    expect(m).toBeTruthy();
    expect(m.title).toMatch(/Miguel/i);
    expect(m.img).toMatch(/galleryStMichael/);
    expect(m.variants.map((v) => v.id)).toEqual(expect.arrayContaining(['es', 'en', 'la']));
    expect(m.variants[0].text).toMatch(/San Miguel Arcángel/i);
  });
});
