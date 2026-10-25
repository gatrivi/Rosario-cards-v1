/**
 * The shipped catalog — `src/data/imageLibraryCatalog.json` — merged into
 * `imageRegistry` as the floor layer under the owner's own edits.
 *
 * It exists because a repeated prayer had a 1–4 image candidate list and cycled
 * with that period. These tests cover the two things that can silently rot it:
 * paths that do not resolve, and tags that make no liturgical sense.
 */
import fs from 'fs';
import path from 'path';
import {
  listImages,
  imagesByTag,
  imagePathsByTags,
  getImage,
} from '../data/imageRegistry';
import { hasLiturgicalCategory, isLiturgicalTag } from '../data/liturgicalCategories';
import { CATALOG, CATALOG_META, listCatalogImages } from '../data/imageLibraryCatalog';

const ROOT = path.join(__dirname, '..', '..');
const PUBLIC = path.join(ROOT, 'public');

const nfc = (p) => p.normalize('NFC');
const existsUnderPublic = (url) => fs.existsSync(path.join(PUBLIC, nfc(url)));
const poolFileExists = (url) => {
  try {
    return fs.existsSync(path.join(PUBLIC, decodeURIComponent(nfc(url))));
  } catch (_) {
    return false;
  }
};

describe('image library catalog', () => {
  test('is large enough to matter and split across both pools', () => {
    // Visual review (scripts/image-visual-review.json): non-Marian and junk files
    // left the Mary pool; reviewed stained glass / chiaroscuro joined both.
    expect(CATALOG_META.count).toBe(233 + 63);
    expect(Object.keys(CATALOG)).toHaveLength(CATALOG_META.count);
    expect(CATALOG_META.byPool).toEqual({ mary: 233, passion: 63 });
  });

  test('every entry resolves on disk, is NFC, and round-trips its URL', () => {
    const broken = [];
    listCatalogImages().forEach((entry) => {
      const url = nfc(entry.path);
      if (entry.path.includes(' ')) broken.push(`unencoded space: ${entry.path}`);
      let decoded = null;
      try {
        decoded = decodeURIComponent(url);
      } catch (_) {
        broken.push(`undecodable: ${entry.path}`);
      }
      if (decoded !== null && encodeURI(decoded) !== url) {
        broken.push(`no round-trip: ${entry.path}`);
      }
      if (!poolFileExists(entry.path)) broken.push(`MISSING: ${entry.path}`);
      if (nfc(entry.path) !== entry.path) broken.push(`not NFC: ${entry.path}`);
    });
    expect(broken).toEqual([]);
  });

  test('each pool is served from a single folder', () => {
    const dirs = new Map();
    listCatalogImages().forEach((entry) => {
      const dir = entry.path.split('/').slice(0, 3).join('/');
      if (!dirs.has(entry.pool)) dirs.set(entry.pool, new Set());
      dirs.get(entry.pool).add(dir);
    });
    const oneDirEach = [...dirs.entries()].every(([, set]) => set.size === 1);
    expect({ dirs: Object.fromEntries([...dirs].map(([k, v]) => [k, [...v]])), oneDirEach }).toEqual({
      dirs: { mary: ['/gallery-images/ave'], passion: ['/gallery-images/passion'] },
      oneDirEach: true,
    });
    listCatalogImages().forEach((e) => expect(e.source).toBe('public'));
  });

  test('every entry has at least one liturgical category', () => {
    // Without this the Asset Studio "Clasificar" grid would show the whole
    // catalog as "Sin clasificar" and `imagesByTag` would find nothing.
    const bad = listCatalogImages()
      .filter((e) => !hasLiturgicalCategory(e.tags || []))
      .map((e) => e.id);
    expect(bad).toEqual([]);
  });

  test('every tag is either a liturgical category or the entry theme', () => {
    const bad = [];
    listCatalogImages().forEach((entry) => {
      (entry.tags || []).forEach((t) => {
        if (!isLiturgicalTag(t) && t !== entry.theme) bad.push(`${entry.id}: ${t}`);
      });
    });
    expect(bad).toEqual([]);
  });

  test('no Mary subject is tagged passion', () => {
    // An Alacoque Sacred Heart plate once sat behind a Marian title; the Passion
    // pool is excluded by subject at generation time and that must hold.
    const wrong = listCatalogImages()
      .filter((e) => e.pool === 'passion')
      .filter((e) => /coronaci[oó]n\s*de\s*la\s*virgen|virgen|maria\b|madonna|our\s*lady|annunciation|anunciaci|loreto/i.test(e.name))
      .map((e) => e.name);
    expect(wrong).toEqual([]);
  });

  test('confidence is kept for Passion only (the owner approved the Mary folder)', () => {
    const withConfidence = listCatalogImages().filter((e) => e.confidence);
    expect(withConfidence.length).toBeGreaterThan(0);
    withConfidence.forEach((e) => {
      expect({ pool: e.pool, ok: ['high', 'low'].includes(e.confidence) }).toEqual({
        pool: 'passion',
        ok: true,
      });
    });
    listCatalogImages().filter((e) => e.pool === 'mary').forEach((e) => {
      expect(e.confidence).toBeUndefined();
    });
  });
});

describe('catalog is a floor, the db is on top', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  test('catalog ids resolve through the normal registry', () => {
    const [first] = listCatalogImages();
    expect(getImage(first.id)).toBeTruthy();
    expect(getImage(first.id).path).toBe(first.path);
    // ...so they are usable anywhere an id is: assignments, pickers, IMG namespace
    expect(listImages().length).toBeGreaterThanOrEqual(70 + CATALOG_META.count);
  });

  test('an owner re-tag wins over the shipped tag', () => {
    const [first] = listCatalogImages();
    expect((getImage(first.id).tags || []).includes('mary')).toBe(true);
    // `saveOverride` is what the Asset Studio writes; simulate the edit.
    const { saveOverride } = require('../data/imageRegistry');
    saveOverride(first.id, { name: 'Renombrada por el dueño', tags: ['generic'] });
    const after = getImage(first.id);
    expect(after.tags).toEqual(['generic']);
    expect(after.name).toBe('Renombrada por el dueño');
    expect(after.path).toBe(first.path); // path is never owner-editable here
  });

  test('selection by tag returns ordered, reject-aware paths', () => {
    // Most-specific-first: the `A` list is annunciation, mother-and-child,
    // theotokos, immaculate, then mary as the backstop. Every Mary image carries
    // `mary`, so if that came first the rest of the list would be inert.
    const mary = imagePathsByTags(['annunciation', 'mother-and-child', 'theotokos', 'immaculate', 'mary'], {
      excludeIds: [],
    });
    expect(mary.length).toBeGreaterThan(200);
    const annunciation = mary.findIndex((p) => /annunciation/i.test(p));
    const sorrowful = mary.findIndex((p) => /sorrows|dolor/i.test(p));
    expect(annunciation).toBeGreaterThanOrEqual(0);
    expect(sorrowful === -1 || annunciation < sorrowful).toBe(true);

    const target = listCatalogImages().find((e) => e.pool === 'mary');
    const pruned = imagePathsByTags(['mary'], { excludeIds: [target.id] });
    expect(pruned).not.toContain(target.path);
  });

  test('text-heavy art never enters a pool selection', () => {
    const paths = imagePathsByTags(['mary', 'passion']);
    paths.forEach((p) => {
      expect(/Prayer-text-handwritten|latin-(ave-maria|gloria|pater-noster)/i.test(p)).toBe(false);
    });
  });

  test('imagesByTag finds catalog entries through the merged registry', () => {
    expect(imagesByTag('mary').length).toBeGreaterThan(200);
    expect(imagesByTag('passion').length).toBeGreaterThan(40);
  });
});
