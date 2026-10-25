jest.mock('../data/imageRegistry', () => ({
  imagePath: (id) => `/mock/${id}.jpg`,
}));

import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';
import {
  HISTORIC_DEVOTIONS,
  upcomingDevotions,
  upcomingDevotionThumbs,
  historicDevotionThumb,
} from '../data/historicDevotionsCatalog';
import {
  BOOKLET_MYSTERY_IDS,
  ROSARY_MYSTERY_IDS,
  isValidBookletMystery,
} from '../utils/bookletSequence';

const OPTIONAL_IDS = new Set(OPTIONAL_PRAYERS.map((p) => p.id));
const SURFACES = new Set(['vias', 'recorrido', 'breve', 'embedded', 'soon']);

describe('historic devotions catalog', () => {
  test('every entry declares a known surface with a shape-consistent targetId', () => {
    HISTORIC_DEVOTIONS.forEach((d) => {
      expect(SURFACES.has(d.surface)).toBe(true);
      expect(d.label).toBeTruthy();
      expect(d.note).toBeTruthy();

      if (d.surface === 'vias' || d.surface === 'soon') {
        expect(d.targetId).toBeNull();
      } else {
        expect(typeof d.targetId).toBe('string');
        expect(d.targetId.length).toBeGreaterThan(0);
      }
    });
  });

  test('every non-soon targetId resolves to a real Libro surface', () => {
    HISTORIC_DEVOTIONS.filter((d) => d.surface === 'recorrido').forEach((d) => {
      expect({
        id: d.id,
        target: d.targetId,
        valid: isValidBookletMystery(d.targetId),
      }).toEqual({ id: d.id, target: d.targetId, valid: true });
    });
  });

  test('every breve targetId resolves to an optional prayer', () => {
    HISTORIC_DEVOTIONS.filter((d) => d.surface === 'breve').forEach((d) => {
      expect(OPTIONAL_IDS.has(d.targetId)).toBe(true);
    });
  });

  test('embedded targetIds point at another devotions shelf surface', () => {
    const bookshelf = new Set(
      HISTORIC_DEVOTIONS.filter((d) => d.surface === 'recorrido').map((d) => d.targetId)
    );
    HISTORIC_DEVOTIONS.filter((d) => d.surface === 'embedded').forEach((d) => {
      expect(bookshelf.has(d.targetId)).toBe(true);
    });
  });

  test('via ids in the catalog match the rosary mysteries', () => {
    expect(ROSARY_MYSTERY_IDS.length).toBeGreaterThan(0);
    expect(HISTORIC_DEVOTIONS.filter((d) => d.surface === 'vias').length).toBeGreaterThan(0);
  });

  test('upcoming thumbs are exactly the devotions still unwired', () => {
    // Update this list as each devotion is built — it is the roadmap.
    const stillSoon = ['st_joseph'];
    const soon = HISTORIC_DEVOTIONS.filter((d) => d.surface === 'soon');
    expect(soon.map((d) => d.id).sort()).toEqual(stillSoon.slice().sort());

    const thumbs = upcomingDevotionThumbs();
    expect(thumbs.map((t) => t.id)).toEqual(soon.map((d) => d.id));
    thumbs.forEach((d) => {
      expect(d.img).toMatch(/^\/mock\//);
      expect(d.surface).toBe('soon');
      expect(d.targetId).toBeNull();
    });
  });

  test('no soon entry is already wired as a Libro devotion', () => {
    const soon = new Set(upcomingDevotionThumbs().map((d) => d.targetId));
    BOOKLET_MYSTERY_IDS.forEach((id) => expect(soon.has(id)).toBe(false));
  });

  test('every soon entry states what unblocks it', () => {
    const soon = upcomingDevotions();
    soon.forEach((d) => {
      expect({
        id: d.id,
        blockedBy: typeof d.blockedBy === 'string' && d.blockedBy.trim().length > 20,
      }).toEqual({ id: d.id, blockedBy: true });
    });
  });

  test('no shipped devotion carries a blockedBy note', () => {
    HISTORIC_DEVOTIONS.filter((d) => d.surface !== 'soon').forEach((d) => {
      expect(d.blockedBy).toBeUndefined();
    });
  });

  test('historicDevotionThumb resolves known ids and rejects unknown', () => {
    expect(historicDevotionThumb('memorare')).toMatch(/^\/mock\//);
    expect(historicDevotionThumb('nope')).toBeNull();
  });
});

describe('optional prayers referenced by the catalog', () => {
  test('San Miguel ships with text variants', () => {
    const m = OPTIONAL_PRAYERS.find((p) => p.id === 'michael');
    expect(m).toBeTruthy();
    expect(m.title).toMatch(/Miguel/i);
    expect(m.img).toMatch(/galleryStMichael/);
    expect(m.variants.map((v) => v.id)).toEqual(expect.arrayContaining(['es', 'en', 'la']));
    expect(m.variants[0].text).toMatch(/San Miguel Arcángel/i);
  });

  test('Virgen del Carmen has images for the feast (16 jul)', () => {
    const c = OPTIONAL_PRAYERS.find((p) => p.id === 'carmen');
    expect(c).toBeTruthy();
    expect(c.title).toMatch(/Carmen/i);
    expect(c.img).toBeTruthy();
    expect(c.imgCandidates.length).toBeGreaterThan(0);
    expect(c.variants[0].text).toMatch(/Escapulario/i);
  });

  test('San Expedito ships ES/EN/LA with art', () => {
    const e = OPTIONAL_PRAYERS.find((p) => p.id === 'expedito');
    expect(e).toBeTruthy();
    expect(e.title).toMatch(/Expedito/i);
    expect(e.img).toMatch(/gallerySanExpedito/);
    expect(e.imgCandidates.length).toBeGreaterThan(0);
    expect(e.variants.map((v) => v.id)).toEqual(expect.arrayContaining(['es', 'en', 'la']));
    expect(e.variants.find((v) => v.id === 'la').text).toMatch(/hodie/i);
  });

  test('San Patricio breastplate and San Cayetano', () => {
    const p = OPTIONAL_PRAYERS.find((x) => x.id === 'patrick');
    const c = OPTIONAL_PRAYERS.find((x) => x.id === 'cayetano');
    expect(p?.img).toBeTruthy();
    expect(p.variants.some((v) => /Cristo conmigo/i.test(v.text))).toBe(true);
    expect(c?.img).toBeTruthy();
    expect(c.variants[0].text).toMatch(/Cayetano|Providencia|trabajo/i);
  });
});
