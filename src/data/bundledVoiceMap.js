/**
 * Bundled Piper TTS clips (public/voice/…).
 * Tier 3 = failsafe guide voice (replace with better packs later).
 * Tier S = user mic takes in IndexedDB (always preferred when enabled).
 *
 * Keys = prayerId or base id (chaplet / Ave steps use `${id}_${idx}`).
 */

/** @typedef {'S'|3} VoiceTier */

export const VOICE_TIER_USER = 'S';
export const VOICE_TIER_BUNDLED = 3;

/** Pack folders under /public/voice/ */
export const VOICE_PACKS = {
  sangrepreciosa: { id: 'sangrepreciosa', label: 'Sangre Preciosa', tier: VOICE_TIER_BUNDLED },
  angelus: { id: 'angelus', label: 'Ángelus', tier: VOICE_TIER_BUNDLED },
  magnificat: { id: 'magnificat', label: 'Magnificat', tier: VOICE_TIER_BUNDLED },
};

const PB = '/voice/sangrepreciosa';
const ANG = '/voice/angelus';
const MAG = '/voice/magnificat';

/** @type {Record<string, string>} */
export const BUNDLED_VOICE_BY_ID = {
  // --- Sangre Preciosa (pack: sangrepreciosa) ---
  PBO_1: `${PB}/PBO_1.wav`,
  PBO_2: `${PB}/PBO_2.wav`,
  PBO_3: `${PB}/PBO_3.wav`,
  PBO_4: `${PB}/PBO_4.wav`,
  PBO_5: `${PB}/PBO_5.wav`,
  PBO_6: `${PB}/PBO_6.wav`,
  PBO_7: `${PB}/PBO_7.wav`,
  PBContrition: `${PB}/PBContrition.wav`,
  PB: `${PB}/PB.wav`,
  PB_P: `${PB}/PB_P.wav`,
  PB_G: `${PB}/PB_G.wav`,
  PBClosing: `${PB}/PBClosing.wav`,
  LPB_Close: `${PB}/LPB_Close.wav`,
  LPB_1: `${PB}/LPB_1.wav`,
  LPB_2: `${PB}/LPB_2.wav`,
  LPB_3: `${PB}/LPB_3.wav`,
  LPB_4: `${PB}/LPB_4.wav`,
  LPB_5: `${PB}/LPB_5.wav`,
  LPB_6: `${PB}/LPB_6.wav`,
  LPB_7: `${PB}/LPB_7.wav`,
  LPB_8: `${PB}/LPB_8.wav`,
  LPB_9: `${PB}/LPB_9.wav`,
  // Shared litany responses (future two-voice; also usable as fallback snippets)
  LPB_resp_ten_piedad: `${PB}/LPB_resp_ten_piedad.wav`,
  LPB_resp_salvamos: `${PB}/LPB_resp_salvamos.wav`,
  LPB_resp_libranos: `${PB}/LPB_resp_libranos.wav`,
  SC: `${PB}/SC.wav`,

  // --- Ángelus (pack: angelus) ---
  ANG_SC: `${ANG}/ANG_SC.wav`,
  ANG_ANNUNCIATION: `${ANG}/ANG_ANNUNCIATION.wav`,
  ANG_AVE: `${ANG}/ANG_AVE.wav`,
  ANG_FIAT: `${ANG}/ANG_FIAT.wav`,
  ANG_INCARNATION: `${ANG}/ANG_INCARNATION.wav`,
  ANG_FINAL: `${ANG}/ANG_FINAL.wav`,

  // --- Magnificat (pack: magnificat) — generated when Piper up ---
  MAG_SC: `${MAG}/MAG_SC.wav`,
  MAG_1: `${MAG}/MAG_1.wav`,
  MAG_2: `${MAG}/MAG_2.wav`,
  MAG_3: `${MAG}/MAG_3.wav`,
  MAG_4: `${MAG}/MAG_4.wav`,
  MAG_5: `${MAG}/MAG_5.wav`,
  MAG_6: `${MAG}/MAG_6.wav`,
  MAG_7: `${MAG}/MAG_7.wav`,
  MAG_DOX: `${MAG}/MAG_DOX.wav`,
};

/** Resolve static voice URL for a sequence step id, or null. */
export function resolveBundledVoiceUrl(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return null;
  if (BUNDLED_VOICE_BY_ID[prayerId]) return BUNDLED_VOICE_BY_ID[prayerId];
  // chaplet: PBContrition_1, PB_12, ANG_AVE_1 → base key
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && BUNDLED_VOICE_BY_ID[m[1]]) return BUNDLED_VOICE_BY_ID[m[1]];
  return null;
}

/** @returns {{ url: string, tier: 3, pack: string } | null} */
export function resolveBundledVoiceClip(prayerId) {
  const url = resolveBundledVoiceUrl(prayerId);
  if (!url) return null;
  const pack = url.includes('/angelus/')
    ? 'angelus'
    : url.includes('/magnificat/')
      ? 'magnificat'
      : 'sangrepreciosa';
  return { url, tier: VOICE_TIER_BUNDLED, pack };
}

/** Ids that have a Tier-3 file mapped (exact keys only, not suffix aliases). */
export function listBundledVoiceKeys() {
  return Object.keys(BUNDLED_VOICE_BY_ID);
}
