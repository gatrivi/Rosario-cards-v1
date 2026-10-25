/**
 * Voice coverage across Libro sequences.
 * Tier S = IndexedDB user take · Tier 3 = bundled Piper · none = missing.
 */

import { resolveBundledVoiceUrl, VOICE_TIER_BUNDLED, VOICE_TIER_USER } from '../data/bundledVoiceMap';
import { buildSequence, BOOKLET_MYSTERY_IDS } from './bookletSequence';
import { getBookletDevotionLabel } from './bookletShare';
import { listAllRecordings } from './prayerRecordingStore';
import {
  cleanPrayerDisplayTitle,
  getSpeakablePrayerText,
} from './speakablePrayerText';
import { getVoicePrefs } from './voicePrefs';

/** Studio dropdown — rosary + short / mid devotions. */
export const VOICE_STUDIO_OPTIONS = [
  { id: 'gozosos', label: 'Rosario · Gozosos' },
  { id: 'dolorosos', label: 'Rosario · Dolorosos' },
  { id: 'gloriosos', label: 'Rosario · Gloriosos' },
  { id: 'luminosos', label: 'Rosario · Luminosos' },
  { id: 'angelus', label: 'Ángelus' },
  { id: 'magnificat', label: 'Magnificat' },
  { id: 'sangrepreciosa_ofrendas', label: 'Siete Ofrendas' },
  { id: 'sangrepreciosa_chaplet', label: 'Corona Sangre' },
  { id: 'sangrepreciosa_litany', label: 'Letanía Sangre' },
  { id: 'viacrucis', label: 'Vía Crucis' },
  { id: 'viacrucis_rosario', label: 'Vía Crucis · Rosario' },
  { id: 'vialucis', label: 'Vía Lucis' },
  { id: 'divinamisericordia', label: 'Divina Misericordia' },
  { id: 'divinamisericordia_novena', label: 'Novena Misericordia' },
  { id: 'sagrado_corazon_adoracion', label: 'Sagrado Corazón' },
];

/**
 * Static Tier-3 coverage for one sequence (no IndexedDB).
 * @returns {{ total, withBundled, missing, rows, uniqueMissingIds }}
 */
export function getBundledCoverage(mysteryType, options = {}) {
  const { lang = 'es', ...seqOpts } = options;
  const sequence = buildSequence(mysteryType, { novenaDay: 1, ...seqOpts });
  const rows = sequence.map((step, slotIndex) => {
    const hasBundled = !!resolveBundledVoiceUrl(step.id, lang);
    return {
      slotIndex,
      prayerId: step.id,
      title: cleanPrayerDisplayTitle(step.title),
      text: getSpeakablePrayerText(step),
      hasBundled,
      tier: hasBundled ? VOICE_TIER_BUNDLED : null,
    };
  });
  const missing = rows.filter((r) => !r.hasBundled);
  const uniqueMissingIds = [...new Set(missing.map((r) => r.prayerId))];
  return {
    mysteryType,
    total: rows.length,
    withBundled: rows.length - missing.length,
    missing: missing.length,
    rows,
    uniqueMissingIds,
  };
}

/**
 * Short→long VV readiness ladder (all Libro sequences by step count).
 * @returns {Array<{ id, total, withBundled, missing, uniqueMissing, ready }>}
 */
export function listDevotionVoiceLadder() {
  return BOOKLET_MYSTERY_IDS.map((id) => {
    const cov = getBundledCoverage(id);
    return {
      id,
      total: cov.total,
      withBundled: cov.withBundled,
      missing: cov.missing,
      uniqueMissing: cov.uniqueMissingIds.length,
      ready: cov.missing === 0,
    };
  }).sort((a, b) => a.total - b.total || a.missing - b.missing);
}

/**
 * Devotions shipped before their guide clips were baked.
 *
 * A devotion lands here when its data is merged but Fish TTS has not run yet
 * (server on :8080 + catts checkout). `bundledVoiceMap.test.js` asserts both
 * directions: every uncovered devotion must be declared here, and every id
 * declared here must still be uncovered — so the list can never go stale.
 *
 * Bake with: python scripts/bake_fish_es_missing.py  →  node scripts/genBundledVoiceMap.js
 * @type {Array<{ id: string, missingIds: string[], note: string }>}
 */
export const AWAITING_BUNDLED_VOICE = [
  { id: 'memorare', missingIds: ['MEM'], note: 'Memorare — ES guide clip pending Fish bake' },
  {
    id: 'medalla_milagrosa',
    missingIds: ['MM_LLAMADA', 'MM_ESTRELLAS', 'MM_CORAZONES'],
    note: 'Medalla Milagrosa — 3 ES guide clips pending Fish bake',
  },
  {
    id: 'inmaculado_corazon',
    missingIds: [
      'IC_OFENSA1',
      'IC_OFENSA2',
      'IC_OFENSA3',
      'IC_OFENSA4',
      'IC_OFENSA5',
      'IC_PROMESA',
      'IC_CONSAGRACION',
    ],
    note: 'Inmaculado Corazón — 7 ES guide clips pending Fish bake',
  },
  {
    id: 'espiritu_santo_novena',
    missingIds: ['ES_ANTIPHON', 'ES_DAY_INTENTION'],
    note: 'Espíritu Santo — 2 ES guide clips pending Fish bake (EF/MP/HG reused from the Mercy chaplet)',
  },
];

/** Smallest Libro devotion that still lacks any Tier-3 clip (by step count). */
export function findSmallestDevotionLackingBundledVoice(excludeIds = []) {
  const skip = new Set(excludeIds);
  return (
    listDevotionVoiceLadder()
      .filter((c) => !skip.has(c.id) && c.missing > 0)
      .map(({ id, total, missing, uniqueMissing }) => ({ id, total, missing, uniqueMissing }))[0] ||
    null
  );
}

/** Devotions with undeclared voice debt. */
export function findUndeclaredVoiceDebt() {
  return listDevotionVoiceLadder()
    .filter((c) => c.missing > 0 && !AWAITING_BUNDLED_VOICE.some((a) => a.id === c.id))
    .map(({ id, missing, uniqueMissing }) => ({ id, missing, uniqueMissing }));
}

/** Declared entries whose clips have since been baked — stale, prune these. */
export function findStaleVoiceDebt() {
  return AWAITING_BUNDLED_VOICE.filter((a) => isDevotionVoiceReady(a.id)).map((a) => a.id);
}

/**
 * Studio / Libro / Cola label for a mystery id.
 *
 * `VOICE_STUDIO_OPTIONS` is a curated short list (the studio and the Cola only
 * offer short / mid devotions), so anything outside it must still resolve to a
 * human name — falling back to the raw id would show `espiritu_santo_novena` in
 * the queue.
 */
export function devotionVoiceLabel(mysteryId) {
  const curated = VOICE_STUDIO_OPTIONS.find((o) => o.id === mysteryId);
  if (curated) return curated.label;
  const shared = getBookletDevotionLabel(mysteryId);
  // The shared label falls back to "Santo Rosario" for unknown ids, so only use
  // it when it actually knows this devotion.
  if (shared && !/^Santo Rosario$/.test(shared.title)) return shared.title;
  return mysteryId;
}

/** True when every step has a Tier-3 clip. */
export function isDevotionVoiceReady(mysteryId) {
  return getBundledCoverage(mysteryId).missing === 0;
}

/**
 * Merge user takes + Tier 3 for studio map.
 * @returns {Promise<Array<{ slotIndex, prayerId, title, text, hasUser, takeCount, hasBundled, bestTier }>>}
 */
export async function getVoiceCoverageMap(mysteryType, options = {}) {
  const sequence = buildSequence(mysteryType, { novenaDay: 1 });
  const all = await listAllRecordings();
  const voiceLang = options.lang || getVoicePrefs().voiceLang || 'es';
  const matchesLanguage = (recording) =>
    recording.voiceLang ? recording.voiceLang === voiceLang : voiceLang === 'es';
  const bySlot = new Map();
  const byPrayer = new Map();

  all.forEach((rec) => {
    if (!matchesLanguage(rec)) return;
    if (rec.mystery === mysteryType) {
      const idx = rec.sequenceIndex;
      if (!bySlot.has(idx)) bySlot.set(idx, []);
      bySlot.get(idx).push(rec);
    }
    if (rec.prayerId) {
      if (!byPrayer.has(rec.prayerId)) byPrayer.set(rec.prayerId, []);
      byPrayer.get(rec.prayerId).push(rec);
    }
  });

  return sequence.map((step, slotIndex) => {
    const slotClips = bySlot.get(slotIndex) || [];
    const prayerClips = byPrayer.get(step.id) || [];
    const takeCount = Math.max(slotClips.length, prayerClips.length);
    const hasUser = takeCount > 0;
    const hasBundled = !!resolveBundledVoiceUrl(step.id, voiceLang);
    let bestTier = null;
    if (hasUser) bestTier = VOICE_TIER_USER;
    else if (hasBundled) bestTier = VOICE_TIER_BUNDLED;
    return {
      slotIndex,
      prayerId: step.id,
      title: cleanPrayerDisplayTitle(step.title),
      text: getSpeakablePrayerText(step),
      hasUser,
      takeCount,
      hasBundled,
      hasRecording: hasUser,
      bestTier,
      voiceLang,
    };
  });
}

export { VOICE_TIER_USER, VOICE_TIER_BUNDLED };
