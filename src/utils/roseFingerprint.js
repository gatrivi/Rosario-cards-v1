/**
 * Rose fingerprints that remember HOW a prayer was prayed.
 *
 * Every earned rose carries the legacy fields (warmthProfile, wiggleProfile,
 * verseCount) plus verseTraits and a `context` describing the prayer session:
 * which surface earned it (rosa gestures, libro page, physics rosary, manual
 * record), how long its Ave María stayed on screen, and the hour of day.
 * VerseDrawing uses that context to tint and weight the ink so no two
 * moments of prayer look identical. All derivation is deterministic: the
 * timestamp is the seed, never Math.random().
 */

export const ROSE_SOURCES = ['rosa', 'libro', 'rosario', 'manual'];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const noise01 = (seed, index) => {
  const value = Math.sin((seed % 1000003) * 0.017 + index * 37.17) * 43758.5453;
  return value - Math.floor(value);
};

/** Hour-of-day bands; deltas tint the rose ink in VerseDrawing. */
export const DAYLIGHT_BANDS = {
  madrugada: { hours: [0, 4],   hue: -10, sat: -8, light: -6 },
  amanecer:  { hours: [5, 7],   hue: 10,  sat: 2,  light: 4 },
  manana:    { hours: [8, 10],  hue: 4,   sat: 6,  light: 3 },
  mediodia:  { hours: [11, 14], hue: 0,   sat: 10, light: 5 },
  tarde:     { hours: [15, 17], hue: 6,   sat: 4,  light: 1 },
  atardecer: { hours: [18, 20], hue: 16,  sat: 0,  light: -3 },
  noche:     { hours: [21, 23], hue: -14, sat: -5, light: -7 },
};

export function daylightBandFromHour(hour) {
  const h = ((hour % 24) + 24) % 24;
  for (const [id, band] of Object.entries(DAYLIGHT_BANDS)) {
    if (h >= band.hours[0] && h <= band.hours[1]) return id;
  }
  return 'tarde';
}

export function daylightBandFromTimestamp(timestamp) {
  return daylightBandFromHour(new Date(timestamp).getHours());
}

/** Attention scale from dwell time: null when unmeasured. 30 min cap. */
export function dwellCalm(dwellMs) {
  if (!Number.isFinite(dwellMs) || dwellMs <= 0) return null;
  const seconds = Math.min(dwellMs, 30 * 60 * 1000) / 1000;
  return clamp01(Math.log(seconds + 1) / Math.log(1801));
}

/**
 * Build one rose fingerprint.
 * @param {object} params
 * @param {string} params.source        'rosa' | 'libro' | 'rosario' | 'manual'
 * @param {number} [params.timestamp]   Prayer moment; also the drawing seed.
 * @param {number|null} [params.dwellMs] Time the Ave María step stayed on screen.
 * @param {object|null} [params.aveRun] { position, total } within the decade.
 * @param {number|null} [params.mysteryDecade]
 * @param {boolean|null} [params.guided] Paced by the app (Guiado) vs Libre.
 * @param {number} [params.verseCount]
 */
export function createRoseFingerprint({
  source,
  timestamp = Date.now(),
  dwellMs = null,
  aveRun = null,
  mysteryDecade = null,
  guided = null,
  verseCount = 10,
}) {
  const seed = Number.isFinite(timestamp) ? timestamp : Date.now();
  const daylight = daylightBandFromTimestamp(seed);
  const hour = new Date(seed).getHours();
  const calm = dwellCalm(dwellMs);

  // Unmeasured steps read as a steady minute of prayer.
  const baseWarmth = calm === null ? 0.45 : 0.18 + calm * 0.62;
  const nightShift = daylight === 'noche' || daylight === 'madrugada' ? -0.05 : 0;

  // How freely the ink may wander, by surface. Manual records stay calm;
  // the physics rosary keeps a bead-swing liveliness; Libre pacing breathes more.
  const movementScale =
    source === 'manual' ? 0.05 :
    source === 'libro' ? 0.22 :
    guided === false ? 0.5 :
    source === 'rosario' ? 0.3 : 0.35;

  const warmth = [];
  const wiggle = [];
  for (let i = 0; i < verseCount; i++) {
    warmth.push(clamp01(baseWarmth + nightShift + noise01(seed, i + 1) * 0.16));
    const drift = 0.35 + 0.65 * noise01(seed, i + 41);
    wiggle.push(Math.round(movementScale * drift * 5 * 100) / 100);
  }

  // Legacy 12-path profiles sampled from the verse traits (old renderer compat).
  const warmthProfile = Array.from({ length: 12 }, (_, i) =>
    warmth[Math.min(Math.floor(i * verseCount / 12), verseCount - 1)]);
  const wiggleProfile = Array.from({ length: 12 }, (_, i) =>
    wiggle[Math.min(Math.floor(i * verseCount / 12), verseCount - 1)]);

  return {
    timestamp: seed,
    source,
    warmthProfile,
    wiggleProfile,
    verseCount,
    verseTraits: { warmth, wiggle },
    context: {
      source,
      dwellMs: calm === null ? null : Math.min(Number(dwellMs), 30 * 60 * 1000),
      hour,
      daylight,
      mysteryDecade: mysteryDecade ?? null,
      guided: guided ?? null,
      avePosition: aveRun?.position ?? null,
      aveTotal: aveRun?.total ?? null,
    },
  };
}

/** Short Spanish label for garden tooltips, e.g. "rezada al atardecer · libro · 2 min". */
const BAND_LABELS = {
  madrugada: 'en la madrugada',
  amanecer: 'al amanecer',
  manana: 'en la mañana',
  mediodia: 'al mediodía',
  tarde: 'por la tarde',
  atardecer: 'al atardecer',
  noche: 'en la noche',
};

const SOURCE_LABELS = {
  rosa: 'mi rosa',
  libro: 'libro',
  rosario: 'rosario',
  manual: 'registrada fuera',
};

export function describeRoseContext(rose) {
  if (!rose) return '';
  const parts = [];
  const daylight = rose.context?.daylight
    ?? (Number.isFinite(rose.timestamp) ? daylightBandFromTimestamp(rose.timestamp) : null);
  if (daylight && BAND_LABELS[daylight]) parts.push(BAND_LABELS[daylight]);
  const src = rose.source ?? rose.context?.source;
  if (src && SOURCE_LABELS[src]) parts.push(SOURCE_LABELS[src]);
  const dwellMs = rose.context?.dwellMs;
  if (Number.isFinite(dwellMs) && dwellMs > 0) {
    parts.push(dwellMs >= 60000
      ? `${Math.round(dwellMs / 60000)} min`
      : `${Math.max(1, Math.round(dwellMs / 1000))} s`);
  }
  return parts.join(' · ');
}
