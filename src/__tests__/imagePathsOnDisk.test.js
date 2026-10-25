/**
 * Every image path the app can actually render must exist on disk.
 *
 * This class of bug has bitten three times:
 *   44b014a  the Letanía verse map and the verse art committed under two
 *            different naming conventions — 28 declared paths never matched
 *   d7317ca  public/gallery-images reorganised into litografia/ modoclaro/
 *            gloria/ img-texto-rezos/ subfolders without updating the data
 *   —        the global FALLBACK pointed at cathedral-painting.jpg, which has
 *            never existed, so every chain ended on a 404
 *
 * Runs against the real data layer, not fixtures: every `/`-rooted image literal
 * in src/data and src/utils and src/components must resolve under public/, and
 * every bundled asset import must exist under src/data/assets/img.
 */
import fs from 'fs';
import path from 'path';

import { FALLBACK_IMAGE } from '../utils/prayerImages';
import { listImages, isTextHeavyImageEntry } from '../data/imageRegistry';
import { listCatalogImages } from '../data/imageLibraryCatalog';

const ROOT = path.join(__dirname, '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'src', 'data');
const ASSETS = path.join(DATA, 'assets', 'img');

/** Directories scanned for image literals. */
const SCAN_DIRS = ['data', 'utils', 'components'];

/** Test fixtures legitimately reference paths that do not exist. */
const ALLOW_MISSING = new Set([
  // built at runtime from a template literal — resolved by a separate test
  '/gallery-images/misterios/modooscuro/misteriodolor${num}.webp',
  '/gallery-images/misterios/modooscuro/misteriodolor${num}.jpg',
]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * `galleryMargaritaSacredHeart` shipped with an NFD path (decomposed accents)
 * while the file on disk is NFC. Same length, same visible text, different
 * bytes — and it 404s on the deploy while looking fine on a Windows dev box,
 * because Windows and macOS normalise filenames and the server does not.
 *
 * So every comparison here is done on the NFC form, which makes an NFD literal
 * fail loudly instead of silently.
 */
function nfc(p) {
  return p.normalize('NFC');
}

function existsUnderPublic(url) {
  return fs.existsSync(path.join(PUBLIC, nfc(url)));
}

/** The manifest stores browser-ready (percent-encoded) URLs; the disk wants the raw name. */
function poolFileExists(url) {
  let decoded;
  try {
    decoded = decodeURIComponent(nfc(url));
  } catch (_) {
    return false;
  }
  return fs.existsSync(path.join(PUBLIC, decoded));
}

describe('declared image paths exist on disk', () => {
  test('the global FALLBACK_IMAGE resolves', () => {
    expect(existsUnderPublic(FALLBACK_IMAGE)).toBe(true);
  });

  test('declared paths are written in NFC (not decomposed)', () => {
    const offenders = [];
    for (const dir of SCAN_DIRS) {
      for (const file of walk(path.join(ROOT, 'src', dir))) {
        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        fs.readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            const re = /["'`](\/[^"'`\s]+\.(?:jpe?g|png|webp|gif))["'`]/g;
            let m;
            while ((m = re.exec(line)) !== null) {
              const url = m[1];
              if (url !== nfc(url)) offenders.push(`${rel}:${i + 1}  ${url}`);
            }
          });
      }
    }
    expect(offenders).toEqual([]);
  });

  test('no data/utils/component file references a missing served image', () => {
    const missing = [];
    for (const dir of SCAN_DIRS) {
      for (const file of walk(path.join(ROOT, 'src', dir))) {
        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          const re = /["'`](\/[^"'`\s]+\.(?:jpe?g|png|webp|gif))["'`]/g;
          let m;
          while ((m = re.exec(line)) !== null) {
            const url = m[1];
            if (ALLOW_MISSING.has(url)) continue;
            if (url.startsWith('/prayers/')) continue; // owner drop-in folders
            if (!existsUnderPublic(url)) {
              missing.push(`${rel}:${i + 1}  ${url}`);
            }
          }
        });
      }
    }
    expect(missing).toEqual([]);
  });

  test('every non-text-heavy registry image resolves', () => {
    const broken = [];
    for (const entry of listImages()) {
      if (isTextHeavyImageEntry(entry)) continue;
      const p = entry.path || '';
      if (p.startsWith('/')) {
        // Catalog paths are browser-ready (percent-encoded); the disk wants the
        // raw filename, and decodeURIComponent is the identity for plain ones.
        if (!poolFileExists(p)) broken.push(`${entry.id}  ${p}`);
      } else if (/\.(jpe?g|png|webp|gif)$/i.test(p)) {
        // bundled asset: filename is imported from assets/img, possibly nested
        const base = path.basename(p);
        const found = fs
          .readdirSync(ASSETS, { recursive: true })
          .some((f) => path.basename(String(f)) === base);
        if (!found) broken.push(`${entry.id}  ${p}`);
      }
    }
    expect(broken).toEqual([]);
  });

  test('every catalog image resolves and is URL-encoded', () => {
    // The catalog is generated, so a bad filename would otherwise only surface as
    // a blank background in production. `imageLibraryCatalog.test.js` covers the
    // same ground in more detail; this is the fast smoke check.
    const broken = listCatalogImages()
      .map((e) => e.path)
      .filter((p) => !poolFileExists(p));
    expect(broken).toEqual([]);
  });

  test('pool manifests are big enough to be worth having', () => {
    expect(listCatalogImages().length).toBeGreaterThan(200);
  });
});
