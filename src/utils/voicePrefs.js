/**
 * Voice source + browser-TTS prefs.
 * Tier S = user mic · Tier 3 = bundled WAV · browser TTS = speechSynthesis fallback (es-ES).
 */

const KEY_USER = 'rosario_voice_user';
const KEY_BUNDLED = 'rosario_voice_bundled';
const KEY_TTS_LANG = 'rosario_voice_tts_lang';
const KEY_TTS_RATE = 'rosario_voice_tts_rate';
const KEY_BROWSER_TTS = 'rosario_voice_browser_tts';

const DEFAULTS = {
  useUserVoice: true,
  useBundledVoice: true,
  useBrowserTts: true,
  ttsLang: 'es-ES',
  ttsRate: 1,
};

function clampRate(n) {
  const x = typeof n === 'number' ? n : parseFloat(n);
  if (Number.isNaN(x)) return DEFAULTS.ttsRate;
  return Math.min(1.5, Math.max(0.7, x));
}

export function getVoicePrefs() {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULTS };
  }
  const rateRaw = localStorage.getItem(KEY_TTS_RATE);
  return {
    useUserVoice: localStorage.getItem(KEY_USER) !== 'false',
    useBundledVoice: localStorage.getItem(KEY_BUNDLED) !== 'false',
    useBrowserTts: localStorage.getItem(KEY_BROWSER_TTS) !== 'false',
    ttsLang: (() => {
      const stored = localStorage.getItem(KEY_TTS_LANG);
      if (!stored) return DEFAULTS.ttsLang;
      // ponytail: v0.3.60 defaulted en-US for Spanish prayers — migrate once
      if (stored === 'en-US') {
        localStorage.setItem(KEY_TTS_LANG, 'es-ES');
        return 'es-ES';
      }
      return stored;
    })(),
    ttsRate: clampRate(rateRaw != null ? rateRaw : DEFAULTS.ttsRate),
  };
}

export function setVoicePrefs(partial) {
  const next = { ...getVoicePrefs(), ...partial };
  next.ttsRate = clampRate(next.ttsRate);
  next.ttsLang = next.ttsLang || DEFAULTS.ttsLang;
  localStorage.setItem(KEY_USER, String(next.useUserVoice !== false));
  localStorage.setItem(KEY_BUNDLED, String(next.useBundledVoice !== false));
  localStorage.setItem(KEY_BROWSER_TTS, String(next.useBrowserTts !== false));
  localStorage.setItem(KEY_TTS_LANG, next.ttsLang);
  localStorage.setItem(KEY_TTS_RATE, String(next.ttsRate));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rosario-voice-prefs', { detail: next }));
  }
  return next;
}
