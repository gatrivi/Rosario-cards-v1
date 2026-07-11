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
  PB_P: `${BASE}/PB_P.wav`,
  PB_G: `${BASE}/PB_G.wav`,
  PBClosing: `${BASE}/PBClosing.wav`,
  LPB_Close: `${BASE}/LPB_Close.wav`,
  LPB_1: `${BASE}/LPB_1.wav`,
  LPB_2: `${BASE}/LPB_2.wav`,
  LPB_3: `${BASE}/LPB_3.wav`,
  LPB_4: `${BASE}/LPB_4.wav`,
  LPB_5: `${BASE}/LPB_5.wav`,
  LPB_6: `${BASE}/LPB_6.wav`,
  LPB_7: `${BASE}/LPB_7.wav`,
  LPB_8: `${BASE}/LPB_8.wav`,
  LPB_9: `${BASE}/LPB_9.wav`,
  SC: `${BASE}/SC.wav`,
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
