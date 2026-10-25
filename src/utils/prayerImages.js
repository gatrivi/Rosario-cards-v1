import { getAssignedPath, getAssignedPrayerPath } from './imageAssignments';
import {
  getFolderBaseImages,
  getFolderVerseImage,
  hasFolderBaseImage,
} from '../data/prayerImageFolders';
import { isTextHeavyImagePath, imagePathsByTags } from '../data/imageRegistry';
import { loadRejectedImages } from './rejectedImages';

/**
 * Last resort when a chain has nothing usable. It must be a file that exists —
 * the previous value has never existed on disk, so every chain ended on a 404
 * and `onError`-stepping walked straight into it. This is `galleryCathedralPraying`
 * ("Catedral — orando"). `imagePathsOnDisk.test.js` fails if it stops resolving.
 */
export const FALLBACK_IMAGE = '/gallery-images/cathedral praing.jpg';

const FALLBACK = FALLBACK_IMAGE;
const MODO = '/gallery-images/misterios/modooscuro/';
const BROKEN_EXT = /\.(xcf|jng|psd|ai)$/i;

/**
 * Prayers that draw on the shared image catalog by tag.
 *
 * `A` is the only Marian id because it is the only Marian prayer that repeats
 * *inside* one sequence (53× per rosary) — `S`, `LL` and `MG1–MG4` occur once, so
 * `occurrenceIndexAt` is always 0 and rotation cannot engage for them.
 *
 * `MP` is the worst-repeated prayer in the app (101×) and is a prayer to
 * *Christ's* Passion, so it asks for `passion` rather than `mary` — the same
 * reason an Alacoque plate behind a Marian title was wrong.
 *
 * Tags are a **most-specific-first preference order**: every Mary image carries
 * the coarse `mary` category, so listing it first would make the rest of the
 * list inert. The finer themes (`annunciation`, `immaculate`, …) outrank the
 * catch-all, and `mary`/`passion` come last as the backstop.
 */
const TAGGED_PRAYER_TAGS = {
  A: ['annunciation', 'mother-and-child', 'theotokos', 'immaculate', 'mary'],
  MP: ['getsemani', 'cross', 'crown-of-thorns', 'passion'],
  DMO1: ['cross', 'getsemani', 'supper', 'passion'],
  DMO2: ['cross', 'getsemani', 'supper', 'passion'],
  MD1: ['getsemani', 'passion'],
  MD2: ['cross', 'passion'],
  MD3: ['crown-of-thorns', 'cross', 'passion'],
  MD4: ['cross', 'passion'],
  MD5: ['cross', 'passion'],
};

/** Prefer modooscuro (imgmo) over light/mododia paths for devotional backgrounds. */
const PREFER_MODOOSCURO = true;

/** Filename-themed extras (matched against prayer id + title). */
const THEMATIC = [
  { re: /contrición|contricion/i, files: ['contricion.jpg', 'contricion2.png'] },
  { re: /credo/i, files: ['credo.webp'] },
  { re: /padre nuestro|^P$/i, files: ['padre-nuestro.jpg'] },
  { re: /ave maría|ave maria|^A$/i, files: ['ave-maria.jpg', 'MetMary-870x489.jpg', 'roseLimaJuarez-870x1250.jpg'] },
  { re: /gloria|^G$/i, files: ['gloria.webp', 'misteriogloria0.jpg'] },
  { re: /fátima|fatima|^F$/i, files: ['francisco_de_asis_2.jpg', 'theresadelisieux.jpg'] },
  { re: /salve|^S$/i, files: ['salve-regina.jpg'] },
  { re: /papa/i, files: ['papa.jpg', 'sanpadrepio.jpg'] },
  { re: /letanía|letania|^LL$/i, files: ['salve-regina.jpg', 'theresadelisieux.jpg'] },
  { re: /ángel|angel|anunciación|anunciacion/i, files: ['festinangelguardia.jpg', 'angeldealaguardia.jpg', 'MetMary-870x489.jpg'] },
  { re: /niño|nino|nacimiento|belén|belen|infant/i, files: ['Georges_de_La_Tour_-_Newlyborn_infant_-_Musée_des_Beaux-Arts_de_Rennes-copy-870x717.jpg'] },
  { re: /cruz|crucifix|crucif/i, files: ['1954.15-The-Crucifixion-864x1536.jpg'] },
  { re: /señal|^SC$/i, files: ['Encounters in the cathedral of Raleigh.jpg'] },
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
    for (const f of files) {
      const url = MODO + f;
      if (!out.includes(url)) out.push(url);
    }
  }
  return out;
}

/**
 * Occurrence-aware pick for the vitral background.
 *
 * A repeated prayer (the Ave María appears 50× in one rosary) used to be handed
 * the raw sequence position as its seed, so `candidates[seq % n]` cycled with
 * period n. With a 3-image pool that meant the same three pictures forever —
 * "the Ave María always shows the same 2–3 images".
 *
 * `occurrence` is instead the count of how many times this prayer id has already
 * appeared at or before the current step, so occurrence 0, 1, 2 … walk the pool
 * in order and every repetition gets its own picture while staying completely
 * deterministic (step N always resolves the same way, every session).
 *
 * `pinnedCount > 0` means the head of `candidates` is an explicit owner pick (a
 * drop-in folder image or a user assignment). That pins the FIRST occurrence
 * only; later occurrences keep rotating through the rest of the pool. Freezing
 * all 50 would make the folder mechanism actively fight variety.
 *
 * FALLBACK_IMAGE is the last entry of every chain and is the `onError` target in
 * `VitralBackground` — it is a safety net, not a candidate. It used to be rotated
 * over like a real image, so a 2-candidate prayer (`P` has just
 * `padre-nuestro.jpg` + the fallback) showed the generic cathedral on half of its
 * 41 repetitions. It is now excluded from the rotation span.
 *
 * `dayOffset` (see `dailyRotationOffset`) shifts where the walk starts so the
 * next day's rosary continues through the pool instead of replaying the same
 * window. It never moves a pinned head off the first occurrence.
 */
export function pickPrayerImage(candidates, occurrence = 0, pinnedCount = 0, dayOffset = 0) {
  if (!candidates?.length) return FALLBACK;
  // Keep indices stable so a pinned head stays at 0.
  const rotatable = candidates.filter((u) => u !== FALLBACK);
  if (!rotatable.length) return FALLBACK;
  if (rotatable.length === 1) return rotatable[0];
  if (pinnedCount > 0 && occurrence <= 0) return rotatable[0];
  // Walk from just after the pinned head so a pin never repeats immediately.
  const from = pinnedCount > 0 ? 1 : 0;
  const span = rotatable.length - from;
  if (span <= 0) return rotatable[0];
  return rotatable[from + ((Math.abs(occurrence) + Math.abs(dayOffset)) % span)];
}

/**
 * How many times `prayerId` has occurred in `sequence` up to and including
 * `index`. 0 for the first appearance, 1 for the second, and so on.
 *
 * @param {Array<{id: string}>} sequence
 * @param {number} index
 */
export function occurrenceIndexAt(sequence, index) {
  const step = sequence?.[index];
  if (!step?.id) return 0;
  let n = 0;
  for (let i = 0; i <= index && i < sequence.length; i += 1) {
    if (sequence[i]?.id === step.id) n += 1;
  }
  return n - 1;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Where today's walk through a repeated prayer's pool starts: one window (the
 * number of times the prayer occurs in `sequence`) per local calendar day. With
 * the 254-candidate Ave María and 53 Aves per rosary, the whole Mary pool comes
 * round in about five days; without it every rosary showed the same 53.
 */
export function dailyRotationOffset(sequence, index, date = new Date()) {
  const step = sequence?.[index];
  if (!step?.id) return 0;
  const perSession = sequence.filter((s) => s?.id === step.id).length;
  if (perSession < 2) return 0;
  const localMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight / MS_PER_DAY) * perSession;
}

function pushImage(candidates, url, push) {
  if (!url || BROKEN_EXT.test(url) || isTextHeavyImagePath(url)) return;
  if (!candidates.includes(url)) push(url);
}

/** Folder images are hand-curated by the owner: skip the text-heavy scrub. */
function pushCurated(candidates, url) {
  if (!url || BROKEN_EXT.test(url)) return;
  if (!candidates.includes(url)) candidates.push(url);
}

function pushFolderBaseImages(candidates, prayerId) {
  getFolderBaseImages(prayerId).forEach((url) => pushCurated(candidates, url));
}

/** Explicit sources at the head of the chain — anything > 0 pins candidates[0]. */
export function countPrayerPinnedSources(prayer) {
  if (!prayer?.id) return 0;
  let n = 0;
  if (getAssignedPrayerPath(prayer.id)) n += 1;
  if (hasFolderBaseImage(prayer.id)) n += 1;
  return n;
}

function pushAssignment(candidates, prayerId, verseIndex, push) {
  const assigned = getAssignedPath(prayerId, verseIndex);
  if (assigned) push(assigned);
}

/** Build ordered candidate URLs for a litany verse background. */
export function getLitanyVerseImageCandidates(verse, prayerFallback = null, verseIndex = 0) {
  const candidates = [];
  const push = (url) => pushImage(candidates, url, (u) => candidates.push(u));
  const prayerId = prayerFallback?.id || 'LL';

  if (!verse) {
    if (prayerFallback?.imgmo) push(prayerFallback.imgmo);
    if (prayerFallback?.img) push(prayerFallback.img);
    pushFolderBaseImages(candidates, prayerId);
    push(FALLBACK);
    return candidates;
  }

  pushAssignment(candidates, prayerId, verseIndex, push);
  pushCurated(candidates, getFolderVerseImage(prayerId, verseIndex));
  pushImage(candidates, getAssignedPrayerPath(prayerId), push);

  if (PREFER_MODOOSCURO) {
    if (verse.imgmo) push(verse.imgmo);
    if (verse.img) push(verse.img);
  } else {
    if (verse.img) push(verse.img);
    if (verse.imgmo) push(verse.imgmo);
  }

  if (prayerFallback?.imgmo) push(prayerFallback.imgmo);
  if (prayerFallback?.img) push(prayerFallback.img);
  pushFolderBaseImages(candidates, prayerId);
  push(FALLBACK);
  return candidates;
}

/**
 * Pick a litany verse image: always the head. Each verse carries its own
 * hand-picked art (`imgmo`/`img`), and the tail is only the prayer-level
 * fallback. Rotating by `verseIndex` here once showed the hand-picked art on
 * 15 of 65 verses and St Francis / the generic lithograph on the rest.
 */
export function resolveLitanyVerseImage(verse, prayerFallback = null, verseIndex = 0) {
  const candidates = getLitanyVerseImageCandidates(verse, prayerFallback, verseIndex);
  return pickPrayerImage(candidates, 0, countPinnedSourcesFor(verse, prayerFallback));
}

/** Pin state for a litany verse: a folder/assignment pin on the verse or its prayer. */
function countPinnedSourcesFor(verse, prayerFallback) {
  const prayerId = prayerFallback?.id || 'LL';
  let n = 0;
  if (getAssignedPrayerPath(prayerId)) n += 1;
  if (hasFolderBaseImage(prayerId)) n += 1;
  if (verse?.id != null && getAssignedPath(prayerId, 0) && verse.id === prayerId) n += 1;
  return n;
}

/** Build ordered candidate URLs for a prayer vitral image. */
export function getPrayerImageCandidates(prayer, mysteryType) {
  if (!prayer) return [FALLBACK];

  const candidates = [];
  const push = (url) => pushImage(candidates, url, (u) => candidates.push(u));

  pushImage(candidates, getAssignedPrayerPath(prayer.id), push);

  pushFolderBaseImages(candidates, prayer.id);

  if (prayer.id?.startsWith('MD') && MODOOSCURO_DOLOR[prayer.id]) {
    push(MODOOSCURO_DOLOR[prayer.id]);
  }

  if (PREFER_MODOOSCURO && prayer.imgmo) push(prayer.imgmo);
  if (prayer.img) {
    if (Array.isArray(prayer.img)) prayer.img.forEach(push);
    else push(prayer.img);
  }
  if (!PREFER_MODOOSCURO && prayer.imgmo) push(prayer.imgmo);

  // Static candidate lists were previously ignored by this chain — merge them
  // in so module-curated pools and the drop-in folders share one ordering.
  if (Array.isArray(prayer.imgCandidates)) prayer.imgCandidates.forEach(push);
  else if (typeof prayer.imgCandidates === 'string') push(prayer.imgCandidates);

  if (prayer.id?.startsWith('MD')) {
    push('/gallery-images/misterios/modooscuro/misteriodolor0.jpg');
  }

  if (mysteryType === 'dolorosos' && prayer.id?.startsWith('MD')) {
    const num = prayer.id.replace('MD', '');
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.webp`);
    push(`/gallery-images/misterios/modooscuro/misteriodolor${num}.jpg`);
  }

  thematicExtras(prayer).forEach(push);

  // Bulk library tier. Sits last so it can only ever be reached when nothing
  // explicit matched, and is deliberately NOT counted by
  // countPrayerPinnedSources — otherwise a non-empty pool would pin
  // candidates[0] and kill the occurrence rotation this tier exists to feed.
  // Bulk catalog tier. Sits last so it can only ever be reached when nothing
  // explicit matched, and is deliberately NOT counted by
  // countPrayerPinnedSources — otherwise a non-empty catalog would pin
  // candidates[0] and kill the occurrence rotation this tier exists to feed.
  const tags = TAGGED_PRAYER_TAGS[prayer.id];
  if (tags) {
    imagePathsByTags(tags, { excludeIds: loadRejectedImages() }).forEach(push);
  }

  push(FALLBACK);
  return candidates;
}

export function resolvePrayerImage(prayer, mysteryType, seed = 0) {
  return pickPrayerImage(getPrayerImageCandidates(prayer, mysteryType), seed);
}
