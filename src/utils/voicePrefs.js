/**
 * Which voice sources play during autoplay.
 * Tier S = user recordings · Tier 3 = bundled Piper failsafe.
 */

const KEY_USER = 'rosario_voice_user';
const KEY_BUNDLED = 'rosario_voice_bundled';

export function getVoicePrefs() {
  if (typeof localStorage === 'undefined') {
    return { useUserVoice: true, useBundledVoice: true };
  }
  return {
    useUserVoice: localStorage.getItem(KEY_USER) !== 'false',
    useBundledVoice: localStorage.getItem(KEY_BUNDLED) !== 'false',
  };
}

export function setVoicePrefs(partial) {
  const next = { ...getVoicePrefs(), ...partial };
  localStorage.setItem(KEY_USER, String(next.useUserVoice !== false));
  localStorage.setItem(KEY_BUNDLED, String(next.useBundledVoice !== false));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rosario-voice-prefs', { detail: next }));
  }
  return next;
}
