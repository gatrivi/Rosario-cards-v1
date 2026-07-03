import { imagePath } from '../data/imageRegistry';
import { getPrayerVerseCatalog } from '../data/prayerVerseCatalog';
import { getAssignedPath } from './imageAssignments';
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

export function getPrayerVerseImageCandidates(prayerId, verseIndex, prayerFallback, mysteryType) {
  const candidates = [];
  const push = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  const assigned = getAssignedPath(prayerId, verseIndex);
  if (assigned) push(assigned);

  const catalog = getPrayerVerseCatalog(prayerId);
  const entry = catalog?.[verseIndex];
  if (entry?.defaultImageId) {
    push(imagePath(entry.defaultImageId));
  }

  getPrayerImageCandidates(prayerFallback, mysteryType).forEach(push);
  return candidates;
}

export function resolvePrayerVerseImage(prayerId, verseIndex, prayerFallback, mysteryType) {
  const candidates = getPrayerVerseImageCandidates(prayerId, verseIndex, prayerFallback, mysteryType);
  return candidates[0] || null;
}
