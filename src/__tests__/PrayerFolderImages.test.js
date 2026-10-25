/**
 * Drop-in prayer folder images (public/prayers/<PRAYER_ID>/): chain priority,
 * pinning, verse files, and the on-disk scanner shared with the manifest script.
 * Conventions: public/prayers/README.txt.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getPrayerImageCandidates,
  getLitanyVerseImageCandidates,
  pickPrayerImage,
  countPrayerPinnedSources,
  occurrenceIndexAt,
  FALLBACK_IMAGE,
} from '../utils/prayerImages';
import { getPrayerVerseImageCandidates } from '../utils/prayerVerseImages';
import {
  __setPrayerFolderManifestForTests,
  getFolderBaseImages,
  getFolderVerseImage,
} from '../data/prayerImageFolders';
import { saveAssignment } from '../utils/imageAssignments';
import { scanPrayerFolders } from '../../scripts/prayerFolderScan';

describe('prayerImageFolders manifest reader', () => {
  afterEach(() => __setPrayerFolderManifestForTests(null));

  test('base images in order; verse files keyed 1-based, read 0-based', () => {
    __setPrayerFolderManifestForTests({
      A: {
        base: ['/prayers/A/rosa.jpg', '/prayers/A/otra.jpg'],
        verses: { 3: '/prayers/A/03-dolorosa.jpg' },
      },
    });
    expect(getFolderBaseImages('A')).toEqual([
      '/prayers/A/rosa.jpg',
      '/prayers/A/otra.jpg',
    ]);
    expect(getFolderVerseImage('A', 2)).toBe('/prayers/A/03-dolorosa.jpg');
    expect(getFolderVerseImage('A', 0)).toBeNull();
    expect(getFolderBaseImages('ZZ')).toEqual([]);
  });
});

describe('folder images in the prayer image chain', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => __setPrayerFolderManifestForTests(null));

  test('no folder: chain unchanged and rotation intact', () => {
    const prayer = { id: 'XTEST', title: 'Prueba', img: '/x/light.jpg', imgmo: '/x/dark.jpg' };
    const candidates = getPrayerImageCandidates(prayer);
    expect(candidates[0]).toBe('/x/dark.jpg');
    expect(countPrayerPinnedSources(prayer)).toBe(0);
    expect(pickPrayerImage(candidates, 1)).toBe(candidates[1]);
  });

  test('folder base image pins the FIRST occurrence, later ones rotate', () => {
    const prayer = { id: 'XTEST', title: 'Prueba', img: '/x/light.jpg', imgmo: '/x/dark.jpg' };
    __setPrayerFolderManifestForTests({
      XTEST: { base: ['/prayers/XTEST/rosa.jpg'], verses: {} },
    });
    const candidates = getPrayerImageCandidates(prayer);
    expect(candidates[0]).toBe('/prayers/XTEST/rosa.jpg');
    const pinned = countPrayerPinnedSources(prayer);
    expect(pinned).toBe(1);

    // Occurrence 0 is the owner's explicit pick, whatever the sequence index.
    expect(pickPrayerImage(candidates, 0, pinned)).toBe('/prayers/XTEST/rosa.jpg');

    // A repeated prayer (50 Ave Marías) must not freeze on it: later
    // occurrences walk the rest of the pool and never come back to the pin
    // until the pool has cycled.
    const later = [];
    for (let occ = 1; occ < 40; occ += 1) {
      later.push(pickPrayerImage(candidates, occ, pinned));
    }
    // Every candidate except the pin and the fallback should be reachable.
    const rotatable = candidates.filter((u) => u !== FALLBACK_IMAGE);
    expect(new Set(later).size).toBe(rotatable.length - 1);
    expect(later[0]).not.toBe('/prayers/XTEST/rosa.jpg');
  });

  test('an unpinned chain still rotates from the head', () => {
    const prayer = { id: 'XTEST', title: 'Prueba', img: '/x/light.jpg', imgmo: '/x/dark.jpg' };
    const candidates = getPrayerImageCandidates(prayer);
    const seen = new Set();
    for (let occ = 0; occ < 20; occ += 1) seen.add(pickPrayerImage(candidates, occ, 0));
    const rotatable = candidates.filter((u) => u !== FALLBACK_IMAGE);
    expect(seen.size).toBe(rotatable.length);
  });

  test('the fallback is never offered while a real candidate exists', () => {
    // It used to be the last slot of the rotation span, so `P` — whose chain is
    // just padre-nuestro.jpg + the fallback — showed the generic cathedral on
    // half of its 41 repetitions.
    const prayer = { id: 'XTEST', title: 'Prueba', img: '/x/light.jpg', imgmo: '/x/dark.jpg' };
    const candidates = getPrayerImageCandidates(prayer);
    expect(candidates).toContain(FALLBACK_IMAGE);
    for (let occ = 0; occ < 30; occ += 1) {
      expect(pickPrayerImage(candidates, occ, 0)).not.toBe(FALLBACK_IMAGE);
      expect(pickPrayerImage(candidates, occ, 1)).not.toBe(FALLBACK_IMAGE);
    }
  });

  test('a chain of nothing but the fallback still returns it', () => {
    expect(pickPrayerImage([FALLBACK_IMAGE], 0, 0)).toBe(FALLBACK_IMAGE);
    expect(pickPrayerImage([FALLBACK_IMAGE], 7, 1)).toBe(FALLBACK_IMAGE);
    expect(pickPrayerImage([], 3, 0)).toBe(FALLBACK_IMAGE);
  });

  test('a single-candidate chain is stable at every occurrence', () => {
    // Every real chain ends with FALLBACK, so a one-element list only happens
    // when nothing else resolved. It must not index out of bounds or drift.
    const only = ['/x/only.jpg'];
    for (let occ = 0; occ < 5; occ += 1) {
      expect(pickPrayerImage(only, occ, 0)).toBe('/x/only.jpg');
    }
    // ...and an empty chain still yields the fallback rather than undefined.
    expect(pickPrayerImage([], 3, 0)).toBe(FALLBACK_IMAGE);
  });

  test('user assignment outranks folder images; both pin', () => {
    saveAssignment('XTEST', 'default', '/gallery-images/misterios/modooscuro/ave-maria.jpg');
    const prayer = { id: 'XTEST', title: 'Prueba', img: '/x/light.jpg' };
    __setPrayerFolderManifestForTests({
      XTEST: { base: ['/prayers/XTEST/rosa.jpg'], verses: {} },
    });
    const candidates = getPrayerImageCandidates(prayer);
    expect(candidates[0]).toBe('/gallery-images/misterios/modooscuro/ave-maria.jpg');
    expect(countPrayerPinnedSources(prayer)).toBe(2);
  });

  test('static imgCandidates join the chain (previously ignored)', () => {
    const prayer = {
      id: 'XTEST',
      title: 'Prueba',
      img: '/x/light.jpg',
      imgCandidates: ['/pool/a.jpg', '/pool/b.jpg'],
    };
    const candidates = getPrayerImageCandidates(prayer);
    expect(candidates).toContain('/pool/a.jpg');
    expect(candidates).toContain('/pool/b.jpg');
    expect(candidates.indexOf('/pool/a.jpg')).toBeGreaterThan(
      candidates.indexOf('/x/light.jpg')
    );
  });

  test('folder verse image pins the per-verse chain', () => {
    __setPrayerFolderManifestForTests({
      A: { base: [], verses: { 3: '/prayers/A/03-dolorosa.jpg' } },
    });
    const fallback = { id: 'A', title: 'Ave María' };
    const candidates = getPrayerVerseImageCandidates('A', 2, fallback, null);
    expect(candidates[0]).toBe('/prayers/A/03-dolorosa.jpg');
  });

  test('litany verse folder image lands first', () => {
    __setPrayerFolderManifestForTests({
      LL: { base: [], verses: { 5: '/prayers/LL/05-regina.jpg' } },
    });
    const candidates = getLitanyVerseImageCandidates({ text: 'Santa María' }, { id: 'LL' }, 4);
    expect(candidates[0]).toBe('/prayers/LL/05-regina.jpg');
  });
});

describe('scanPrayerFolders (shared with the manifest script)', () => {
  const tmpRoot = path.join(os.tmpdir(), `prayer-folders-test-${Date.now()}`);

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  test('splits base vs verse files, skips junk, encodes URLs', () => {
    fs.mkdirSync(path.join(tmpRoot, 'A'), { recursive: true });
    fs.mkdirSync(path.join(tmpRoot, 'B'), { recursive: true });
    fs.writeFileSync(path.join(tmpRoot, 'A', 'rosa.jpg'), 'x');
    fs.writeFileSync(path.join(tmpRoot, 'A', '03-dolorosa.png'), 'x');
    fs.writeFileSync(path.join(tmpRoot, 'A', '03-duplicate.jpg'), 'x'); // 2nd 03 → base
    fs.writeFileSync(path.join(tmpRoot, 'B', 'Thumbs.db'), 'x');
    fs.writeFileSync(path.join(tmpRoot, 'B', 'con espacio.webp'), 'x');

    const table = scanPrayerFolders(tmpRoot);
    expect(table.A.base).toEqual(['/prayers/A/03-duplicate.jpg', '/prayers/A/rosa.jpg']);
    expect(table.A.verses[3]).toBe('/prayers/A/03-dolorosa.png');
    expect(table.B.base).toEqual(['/prayers/B/con%20espacio.webp']);
    expect(table.B.verses).toEqual({});
  });

  test('missing folder returns an empty table', () => {
    expect(scanPrayerFolders(path.join(os.tmpdir(), 'definitely-not-here-12345'))).toEqual({});
  });
});
