/**
 * Bundled Piper TTS clips (public/voice/…). IndexedDB user takes win when present.
 * Keys = prayerId or base id (chaplet steps use `${id}_${idx}`).
 */

const BASE = '/voice/sangrepreciosa';

/** @type {Record<string, string>} */
export const BUNDLED_VOICE_BY_ID = {
  PBO_1: `${BASE}/PBO_1.wav`,
  PBO_2: `${BASE}/PBO_2.wav`,
  PBO_3: `${BASE}/PBO_3.wav`,
  PBO_4: `${BASE}/PBO_4.wav`,
  PBO_5: `${BASE}/PBO_5.wav`,
  PBO_6: `${BASE}/PBO_6.wav`,
  PBO_7: `${BASE}/PBO_7.wav`,
  PBContrition: `${BASE}/PBContrition.wav`,
  PB: `${BASE}/PB.wav`,
  PBClosing: `${BASE}/PBClosing.wav`,
  LPB_Close: `${BASE}/LPB_Close.wav`,
};

/** Resolve static voice URL for a sequence step id, or null. */
export function resolveBundledVoiceUrl(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return null;
  if (BUNDLED_VOICE_BY_ID[prayerId]) return BUNDLED_VOICE_BY_ID[prayerId];
  // chaplet: PBContrition_1, PB_12, PBClosing_50 → base key
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && BUNDLED_VOICE_BY_ID[m[1]]) return BUNDLED_VOICE_BY_ID[m[1]];
  return null;
}
