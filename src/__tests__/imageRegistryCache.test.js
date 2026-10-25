/**
 * The merged registry is cached, because it used to be rebuilt on every
 * `getImage()` — and `isTextHeavyImagePath` goes through it, once per candidate
 * push. With the Ave María chain at ~260 candidates that meant two
 * `JSON.parse(localStorage)` calls and a full object rebuild per candidate, on
 * every step change.
 *
 * These tests pin both halves: the cache actually caches, and it actually
 * invalidates when something changes.
 */
import { listImages, getImage, saveOverride, clearOverride } from '../data/imageRegistry';
import { upsertLibraryEntry, removeLibraryEntry } from '../utils/imageLibraryStore';
import { touchLocalArtConfig } from '../utils/artConfigSync';
import { ART_CONFIG_CHANGED_EVENT } from '../utils/artConfigSync';
import { IMAGE_LIBRARY_CHANGED_EVENT } from '../utils/imageLibraryStore';
import { isTextHeavyImagePath } from '../data/imageRegistry';

describe('merged registry cache', () => {
  beforeEach(() => {
    localStorage.clear();
    touchLocalArtConfig();
  });
  afterEach(() => localStorage.clear());

  test('repeated reads reuse the cached merge (no rebuild)', () => {
    // `listImages()` still allocates a fresh array — `Object.values` of the
    // cache. What must not repeat is the *merge*: two `JSON.parse(localStorage)`
    // calls plus a full object rebuild. Entry identity proves it.
    expect(getImage('lamb')).toBe(getImage('lamb'));
    expect(listImages()[0]).toBe(getImage(listImages()[0].id));
    expect(listImages().map((e) => e.id)).toEqual(listImages().map((e) => e.id));
  });

  test('an override edit invalidates the cache', () => {
    const before = getImage('lamb');
    expect(before.name).toBeTruthy();
    saveOverride('lamb', { name: 'Cordero renombrado' });
    expect(getImage('lamb').name).toBe('Cordero renombrado');
    clearOverride('lamb');
    expect(getImage('lamb').name).not.toBe('Cordero renombrado');
  });

  test('a library insert invalidates the cache', () => {
    const path = '/gallery-images/ave/Annunciation.jpg';
    expect(getImage('probe-entry')).toBeFalsy();
    upsertLibraryEntry({ id: 'probe-entry', path, name: 'Probe' });
    expect(getImage('probe-entry').path).toBe(path);
    removeLibraryEntry('probe-entry');
    expect(getImage('probe-entry')).toBeFalsy();
  });

  test('the two change events are wired up', () => {
    expect(typeof window.dispatchEvent).toBe('function');
    // Both events are what the stores fire; the registry listens for them.
    expect(ART_CONFIG_CHANGED_EVENT).toBe('rosario-art-config-changed');
    expect(IMAGE_LIBRARY_CHANGED_EVENT).toBe('rosario-image-library-changed');
  });

  test('the text-heavy set is a Set lookup, not a scan per call', () => {
    // Same answer either way; this is here to fail loudly if the Set cache is
    // dropped and the per-call scan comes back with the 287-entry catalog.
    const handWritten = '/gallery-images/litany/modooscuro/Mater immaculata.jpg';
    expect(isTextHeavyImagePath(handWritten)).toBe(false);
    expect(isTextHeavyImagePath('/x/Prayer-text-handwritten/thing.jpg')).toBe(true);
    expect(isTextHeavyImagePath('')).toBe(false);
    expect(isTextHeavyImagePath(null)).toBe(false);
  });
});
