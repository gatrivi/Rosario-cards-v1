import { imagePath, isTextHeavyImagePath, listImages } from '../data/imageRegistry';
import { loadRejectedImages } from './rejectedImages';
import { getPrayerVerseCatalog } from '../data/prayerVerseCatalog';
import { getFolderBaseImages, getFolderVerseImage } from '../data/prayerImageFolders';
import { getAssignedPath, getAssignedPrayerPath } from './imageAssignments';
import { getPrayerImageCandidates } from './prayerImages';

export function getPrayerVerseCount(prayerId) {
  return getPrayerVerseCatalog(prayerId)?.length || 0;
}

export function getPrayerVerseText(prayerId, verseIndex) {
  const catalog = getPrayerVerseCatalog(prayerId);
  if (!catalog?.length) return null;
  const i = Math.min(Math.max(verseIndex, 0), catalog.length - 1);
  return catalog[i].text;
}

const PREFERRED_STYLE_RANK = { 'stained-glass': 0, chiaroscuro: 0 };
const themedPoolCache = new Map();

/**
 * Every image whose tags or reviewed subjects name one of the verse's themes,
 * stained glass and chiaroscuro first, then by path so the order is stable.
 */
export function getVerseThemePool(prayerId, verseIndex) {
  const themes = getPrayerVerseCatalog(prayerId)?.[verseIndex]?.themes;
  if (!themes?.length) return [];
  const rejected = loadRejectedImages();
  const key = `${themes.join(' ')}|${rejected.join(' ')}`;
  const hit = themedPoolCache.get(key);
  if (hit) return hit;
  const wanted = new Set(themes);
  const skip = new Set(rejected);
  const pool = listImages()
    .filter((e) => e.path && !skip.has(e.id) && !isTextHeavyImagePath(e.path))
    .filter((e) => [...(e.tags || []), ...(e.subjects || [])].some((t) => wanted.has(t)))
    .sort((a, b) =>
      (PREFERRED_STYLE_RANK[a.style] ?? 1) - (PREFERRED_STYLE_RANK[b.style] ?? 1)
      || a.path.localeCompare(b.path))
    .map((e) => e.path)
    .filter((url, i, all) => all.indexOf(url) === i);
  themedPoolCache.set(key, pool);
  return pool;
}

/** An owner pick (assignment or folder) for this verse or its whole prayer. */
function hasVersePin(prayerId, verseIndex) {
  return Boolean(
    getAssignedPath(prayerId, verseIndex)
    || getFolderVerseImage(prayerId, verseIndex)
    || getAssignedPrayerPath(prayerId)
    || getFolderBaseImages(prayerId).length
  );
}

export function getPrayerVerseImageCandidates(prayerId, verseIndex, prayerFallback, mysteryType) {
  const candidates = [];
  const push = (url) => {
    if (url && !isTextHeavyImagePath(url) && !candidates.includes(url)) candidates.push(url);
  };
  // Folder images are hand-curated: they skip the text-heavy scrub.
  const pushCurated = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  const assigned = getAssignedPath(prayerId, verseIndex);
  if (assigned) push(assigned);
  pushCurated(getFolderVerseImage(prayerId, verseIndex));
  const baseAssigned = getAssignedPrayerPath(prayerId);
  if (baseAssigned) push(baseAssigned);
  getFolderBaseImages(prayerId).forEach(pushCurated);

  getVerseThemePool(prayerId, verseIndex).forEach(push);

  const catalog = getPrayerVerseCatalog(prayerId);
  const entry = catalog?.[verseIndex];
  if (entry?.defaultImageId) {
    push(imagePath(entry.defaultImageId));
  }

  getPrayerImageCandidates(prayerFallback, mysteryType).forEach(push);
  return candidates;
}

/**
 * The image for one verse. An owner pin always wins. Otherwise a themed verse
 * walks its pool by `rotation` (the prayer's occurrence plus the daily offset),
 * so each of the 53 Aves greets with a different Annunciation, and the next
 * day continues where this one stopped.
 */
export function resolvePrayerVerseImage(prayerId, verseIndex, prayerFallback, mysteryType, rotation = 0) {
  const candidates = getPrayerVerseImageCandidates(prayerId, verseIndex, prayerFallback, mysteryType);
  if (!hasVersePin(prayerId, verseIndex)) {
    const pool = getVerseThemePool(prayerId, verseIndex);
    if (pool.length) return pool[Math.abs(rotation) % pool.length];
  }
  return candidates[0] || null;
}
