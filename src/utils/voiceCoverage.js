/**
 * Voice coverage across Libro sequences.
 * Tier S = IndexedDB user take · Tier 3 = bundled Piper · none = missing.
 */

import { resolveBundledVoiceUrl, VOICE_TIER_BUNDLED, VOICE_TIER_USER } from '../data/bundledVoiceMap';
import { buildSequence, BOOKLET_MYSTERY_IDS } from './bookletSequence';
import { listAllRecordings } from './prayerRecordingStore';

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
  const sequence = buildSequence(mysteryType, { novenaDay: 1, ...options });
  const rows = sequence.map((step, slotIndex) => {
    const hasBundled = !!resolveBundledVoiceUrl(step.id);
    return {
      slotIndex,
      prayerId: step.id,
      title: step.title,
      text: step.text,
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

/** Smallest Libro devotion that still lacks any Tier-3 clip (by step count). */
export function findSmallestDevotionLackingBundledVoice(excludeIds = []) {
  const skip = new Set(excludeIds);
  const candidates = BOOKLET_MYSTERY_IDS.filter((id) => !skip.has(id))
    .map((id) => {
      const cov = getBundledCoverage(id);
      return { id, total: cov.total, missing: cov.missing, uniqueMissing: cov.uniqueMissingIds.length };
    })
    .filter((c) => c.missing > 0)
    .sort((a, b) => a.total - b.total || a.missing - b.missing);
  return candidates[0] || null;
}

/**
 * Merge user takes + Tier 3 for studio map.
 * @returns {Promise<Array<{ slotIndex, prayerId, title, text, hasUser, takeCount, hasBundled, bestTier }>>}
 */
export async function getVoiceCoverageMap(mysteryType) {
  const sequence = buildSequence(mysteryType, { novenaDay: 1 });
  const all = await listAllRecordings();
  const bySlot = new Map();
  const byPrayer = new Map();

  all.forEach((rec) => {
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
    const hasBundled = !!resolveBundledVoiceUrl(step.id);
    let bestTier = null;
    if (hasUser) bestTier = VOICE_TIER_USER;
    else if (hasBundled) bestTier = VOICE_TIER_BUNDLED;
    return {
      slotIndex,
      prayerId: step.id,
      title: step.title,
      text: step.text,
      hasUser,
      takeCount,
      hasBundled,
      hasRecording: hasUser,
      bestTier,
    };
  });
}

export { VOICE_TIER_USER, VOICE_TIER_BUNDLED };
