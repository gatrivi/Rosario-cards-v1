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

  test('Virgen del Carmen optional prayer has images for feast (16 jul)', () => {
    const c = OPTIONAL_PRAYERS.find((p) => p.id === 'carmen');
    expect(c).toBeTruthy();
    expect(c.title).toMatch(/Carmen/i);
    expect(c.img).toBeTruthy();
    expect(c.imgCandidates.length).toBeGreaterThan(0);
    expect(c.variants[0].text).toMatch(/Escapulario/i);
  });

  test('San Expedito optional prayer ships ES/EN/LA with art', () => {
    const e = OPTIONAL_PRAYERS.find((p) => p.id === 'expedito');
    expect(e).toBeTruthy();
    expect(e.title).toMatch(/Expedito/i);
    expect(e.img).toMatch(/gallerySanExpedito/);
    expect(e.imgCandidates.length).toBeGreaterThan(0);
    expect(e.variants.map((v) => v.id)).toEqual(expect.arrayContaining(['es', 'en', 'la']));
    expect(e.variants.find((v) => v.id === 'la').text).toMatch(/hodie/i);
    expect(HISTORIC_DEVOTIONS.find((d) => d.id === 'st_expeditus')?.status).toBe('have');
  });
});
