import { getAssignedPath, getAssignedPrayerPath } from './imageAssignments';
import { isTextHeavyImagePath } from '../data/imageRegistry';
import { curatedPrayerArt } from '../data/curatedPrayerArt';

const MODO = '/gallery-images/misterios/modooscuro/';
const BROKEN_EXT = /\.(xcf|jng|psd|ai)$/i;
const MYSTERY_SPECIFIC_ID = /^M(?:G|D|L)\d$/;

/** Prefer modooscuro (imgmo) over light/mododia paths for devotional backgrounds. */
const PREFER_MODOOSCURO = true;

/**
 * Mystery prayers need a context-aware art assignment id.
 * RosarioPrayerBook historically reuses MG1..MG5 for both Joyful and Glorious
 * mysteries, even though those ids describe completely different events.
 */
export function prayerArtAssignmentId(prayerId, mysteryType) {
  if (!prayerId) return prayerId;
  if (mysteryType && MYSTERY_SPECIFIC_ID.test(prayerId)) {
    return `${mysteryType}:${prayerId}`;
  }
  return prayerId;
}

/** Conservative thematic extras. Exact/curated art always comes first. */
const THEMATIC = [
  { re: /papa/i, files: ['papa.jpg', 'sanpadrepio.jpg'] },
  { re: /ángel|angel|anunciación|anunciacion/i, files: ['festinangelguardia.jpg', 'angeldealaguardia.jpg'] },
  { re: /niño|nino|nacimiento|belén|belen|infant/i, files: ['Georges_de_La_Tour_-_Newlyborn_infant_-_Musée_des_Beaux-Arts_de_Rennes-copy-870x717.jpg'] },
  { re: /cruz|crucifix|crucif/i, files: ['1954.15-The-Crucifixion-864x1536.jpg'] },
];

const MODOOSCURO_DOLOR = {
  MD1: '/gallery-images/misterios/modooscuro/misteriodolor1.webp',
  MD2: '/gallery-images/misterios/modooscuro/misteriodolor2.jpg',
  MD3: '/gallery-images/misterios/modooscuro/misteriodolor3.webp',
  MD4: '/gallery-images/misterios/modooscuro/misteriodolor4.webp',
  MD5: '/gallery-images/misterios/modooscuro/misteriodolor5.jpg',
};

function thematicExtras(prayer) {
  if (!prayer) return [];
  const hay = `${prayer.id || ''} ${prayer.title || ''}`;
  const out = [];
  for (const { re, files } of THEMATIC) {
    if (!re.test(hay)) continue;
    for (const file of files) {
      const url = MODO + file;
      if (!out.includes(url)) out.push(url);
    }
  }
  return out;
}

export function pickPrayerImage(candidates, seed = 0) {
  if (!candidates?.length) return null;
  const n = candidates.length;
  const idx = Math.abs(seed) % n;
  return candidates[idx] || null;
}

function pushImage(candidates, url, push) {
  if (!url || BROKEN_EXT.test(url) || isTextHeavyImagePath(url)) return;
  if (!candidates.includes(url)) push(url);
}

function pushAssignment(candidates, prayerId, verseIndex, push) {
  const assigned = getAssignedPath(prayerId, verseIndex);
  if (assigned) push(assigned);
}

function pushPrayerAssignment(candidates, prayerId, mysteryType, push) {
  const assignmentId = prayerArtAssignmentId(prayerId, mysteryType);
  pushImage(candidates, getAssignedPrayerPath(assignmentId), push);

  // Deliberately do not fall back from scoped MG/MD/ML ids to a legacy global
  // override. `MG3:default` is ambiguous because MG3 means Nativity in the
  // Joyful mysteries and Pentecost in the Glorious mysteries.
}

/** Build ordered candidate URLs for a litany verse background. */
export function getLitanyVerseImageCandidates(verse, prayerFallback = null, verseIndex = 0) {
  const candidates = [];
  const push = (url) => pushImage(candidates, url, (value) => candidates.push(value));
  const prayerId = prayerFallback?.id || 'LL';

  pushAssignment(candidates, prayerId, verseIndex, push);
  pushImage(candidates, getAssignedPrayerPath(prayerId), push);

  if (!verse) {
    curatedPrayerArt(prayerId).forEach(push);
    if (prayerFallback?.imgmo) push(prayerFallback.imgmo);
    if (prayerFallback?.img) push(prayerFallback.img);
    return candidates;
  }

  if (PREFER_MODOOSCURO) {
    if (verse.imgmo) push(verse.imgmo);
    if (verse.img) push(verse.img);
  } else {
    if (verse.img) push(verse.img);
    if (verse.imgmo) push(verse.imgmo);
  }

  curatedPrayerArt(prayerId).forEach(push);
  if (prayerFallback?.imgmo) push(prayerFallback.imgmo);
  if (prayerFallback?.img) push(prayerFallback.img);
  return candidates;
}

export function resolveLitanyVerseImage(verse, prayerFallback = null, seed = 0) {
  return pickPrayerImage(getLitanyVerseImageCandidates(verse, prayerFallback, seed), 0);
}

/** Build ordered candidate URLs for a prayer background. */
export function getPrayerImageCandidates(prayer, mysteryType) {
  if (!prayer) return [];

  const candidates = [];
  const push = (url) => pushImage(candidates, url, (value) => candidates.push(value));

  pushPrayerAssignment(candidates, prayer.id, mysteryType, push);

  // Curated art deliberately precedes legacy img/imgmo values. This is where
  // we repair known bad mappings and duplicate blobs without rewriting prayer text data.
  curatedPrayerArt(prayer.id, mysteryType).forEach(push);

  if (prayer.id?.startsWith('MD') && MODOOSCURO_DOLOR[prayer.id]) {
    push(MODOOSCURO_DOLOR[prayer.id]);
  }

  if (PREFER_MODOOSCURO && prayer.imgmo) push(prayer.imgmo);
  if (prayer.img) {
    if (Array.isArray(prayer.img)) prayer.img.forEach(push);
    else push(prayer.img);
  }
  if (!PREFER_MODOOSCURO && prayer.imgmo) push(prayer.imgmo);

  if (mysteryType === 'dolorosos' && prayer.id?.startsWith('MD')) {
    const num = prayer.id.replace('MD', '');
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.webp`);
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.jpg`);
  }

  thematicExtras(prayer).forEach(push);

  // Do not append a generic cathedral. A missing image should remain visible
  // as missing so it can be fixed instead of silently showing unrelated art.
  return candidates;
}

export function resolvePrayerImage(prayer, mysteryType, seed = 0) {
  return pickPrayerImage(getPrayerImageCandidates(prayer, mysteryType), seed);
}
