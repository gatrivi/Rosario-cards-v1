/**
 * Voice source + language pack prefs.
 * Tier S = user mic · Tier 3 = bundled /voice/{lang} WAV · browser TTS = last resort.
 */

import { normalizeVoiceLang } from '../data/bundledVoiceMap';

const KEY_USER = 'rosario_voice_user';
const KEY_BUNDLED = 'rosario_voice_bundled';
const KEY_TTS_LANG = 'rosario_voice_tts_lang';
const KEY_TTS_RATE = 'rosario_voice_tts_rate';
const KEY_BROWSER_TTS = 'rosario_voice_browser_tts';
const KEY_VOICE_LANG = 'rosario_voice_lang';

const TTS_BY_VOICE_LANG = {
  es: 'es-ES',
  en: 'en-US',
  la: 'la',
};

const SPANISH_VARIANT_IDS = new Set([
  'versos',
  'niceno',
  'breve',
  'es',
  'es_dulce',
  'es_corta',
]);

const DEFAULTS = {
  useUserVoice: true,
  useBundledVoice: true,
  // ponytail: off by default — mismatched TTS + booklet text = panic
  useBrowserTts: false,
  voiceLang: 'es',
  ttsLang: 'es-ES',
  ttsRate: 1,
};

function clampRate(n) {
  const x = typeof n === 'number' ? n : parseFloat(n);
  if (Number.isNaN(x)) return DEFAULTS.ttsRate;
  return Math.min(1.5, Math.max(0.7, x));
}

function readVoiceLang() {
  if (typeof localStorage === 'undefined') return DEFAULTS.voiceLang;
  return normalizeVoiceLang(localStorage.getItem(KEY_VOICE_LANG)) || DEFAULTS.voiceLang;
}

export function getVoicePrefs() {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULTS };
  }
  const voiceLang = readVoiceLang();
  const rateRaw = localStorage.getItem(KEY_TTS_RATE);
  return {
    useUserVoice: localStorage.getItem(KEY_USER) !== 'false',
    useBundledVoice: localStorage.getItem(KEY_BUNDLED) !== 'false',
    useBrowserTts: localStorage.getItem(KEY_BROWSER_TTS) === 'true',
    voiceLang,
    ttsLang: localStorage.getItem(KEY_TTS_LANG) || TTS_BY_VOICE_LANG[voiceLang] || DEFAULTS.ttsLang,
    ttsRate: clampRate(rateRaw != null ? rateRaw : DEFAULTS.ttsRate),
  };
}

export function setVoicePrefs(partial) {
  const next = { ...getVoicePrefs(), ...partial };
  next.ttsRate = clampRate(next.ttsRate);
  const lang = normalizeVoiceLang(next.voiceLang) || DEFAULTS.voiceLang;
  next.voiceLang = lang;
  if (partial?.voiceLang != null && partial.ttsLang == null) {
    next.ttsLang = TTS_BY_VOICE_LANG[lang] || next.ttsLang;
  }
  next.ttsLang = next.ttsLang || TTS_BY_VOICE_LANG[lang] || DEFAULTS.ttsLang;
  localStorage.setItem(KEY_USER, String(next.useUserVoice !== false));
  localStorage.setItem(KEY_BUNDLED, String(next.useBundledVoice !== false));
  localStorage.setItem(KEY_BROWSER_TTS, String(next.useBrowserTts === true));
  localStorage.setItem(KEY_VOICE_LANG, next.voiceLang);
  localStorage.setItem(KEY_TTS_LANG, next.ttsLang);
  localStorage.setItem(KEY_TTS_RATE, String(next.ttsRate));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rosario-voice-prefs', { detail: next }));
  }
  return next;
}

export function getVoiceLangForVariant(variantId, fallback = DEFAULTS.voiceLang) {
  const normalized = normalizeVoiceLang(variantId);
  if (normalized) return normalized;
  if (typeof variantId === 'string' && SPANISH_VARIANT_IDS.has(variantId.toLowerCase())) {
    return 'es';
  }
  return normalizeVoiceLang(fallback) || DEFAULTS.voiceLang;
}

/** Apply UI variant id (es|en|la|latin) to voice pack if it is a language. */
export function applyVariantToVoiceLang(variantId) {
  const lang = getVoiceLangForVariant(variantId, null);
  if (!lang) return getVoicePrefs();
  return setVoicePrefs({ voiceLang: lang });
}
