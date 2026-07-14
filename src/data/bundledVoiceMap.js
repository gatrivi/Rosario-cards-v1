/**
 * Bundled TTS clips (public/voice/…).
 * Tier 3 = guide voice · Tier S = user mic (IndexedDB).
 *
 * Spanish Piper packs removed — English clips go under /voice/en/ when ready.
 * Keys = prayerId or base id (chaplet / Ave steps use `${id}_${idx}`).
 */

/** @typedef {'S'|3} VoiceTier */

export const VOICE_TIER_USER = 'S';
export const VOICE_TIER_BUNDLED = 3;

/** Pack folders under /public/voice/ */
export const VOICE_PACKS = {
  en: { id: 'en', label: 'English (guide)', tier: VOICE_TIER_BUNDLED },
};

/** @type {Record<string, string>} */
export const BUNDLED_VOICE_BY_ID = {
  // ponytail: empty until English clips land in public/voice/en/
};

/** Resolve static voice URL for a sequence step id, or null. */
export function resolveBundledVoiceUrl(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return null;
  if (BUNDLED_VOICE_BY_ID[prayerId]) return BUNDLED_VOICE_BY_ID[prayerId];
  const m = prayerId.match(/^(.*)_\d+$/);
  if (m && BUNDLED_VOICE_BY_ID[m[1]]) return BUNDLED_VOICE_BY_ID[m[1]];
  return null;
}

/** @returns {{ url: string, tier: 3, pack: string } | null} */
export function resolveBundledVoiceClip(prayerId) {
  const url = resolveBundledVoiceUrl(prayerId);
  if (!url) return null;
  const pack = url.includes('/voice/en/') ? 'en' : 'unknown';
  return { url, tier: VOICE_TIER_BUNDLED, pack };
}

/** Ids that have a Tier-3 file mapped (exact keys only, not suffix aliases). */
export function listBundledVoiceKeys() {
  return Object.keys(BUNDLED_VOICE_BY_ID);
}
