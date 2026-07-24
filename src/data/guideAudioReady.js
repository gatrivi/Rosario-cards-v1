/**
 * CatTS guide-audio pack readiness (Libro thumbs).
 * Keep in sync with catts fixtures under fixtures/prayer-*.
 */

/** Mystery / devotion ids that have a generated ES guide pack. */
export const GUIDE_AUDIO_READY_IDS = new Set([
  'gozosos',
  'dolorosos',
  'gloriosos',
  'luminosos',
]);

export function hasGuideAudio(mysteryOrDevotionId) {
  return GUIDE_AUDIO_READY_IDS.has(mysteryOrDevotionId);
}
