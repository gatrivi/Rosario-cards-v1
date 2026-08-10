import { getVariantStorageKey, pickVariantIdForLang } from '../data/prayerVariants';
import { resolveEnLiberFishText } from '../data/enLiberFishTexts';
import { resolveEnGuideTitle } from '../data/enGuideText';
import { getVoicePrefs } from './voicePrefs';
import { cleanPrayerDisplayTitle } from './speakablePrayerText';

export function resolveDisplayText(activePrayer, variantId) {
  if (!activePrayer) return '';
  const variants = activePrayer.variants;
  if (variants?.length && variantId) {
    const chosen = variants.find((v) => v.id === variantId);
    if (chosen) return chosen.text;
  }
  return activePrayer.text || '';
}

function wantsEnglish(voiceLang) {
  const lang = String(voiceLang || 'es').toLowerCase();
  return lang === 'en' || lang.startsWith('en');
}

/**
 * Liber glass body when voiceLang is EN — Fish EN / EN variant only.
 * @returns {string|null} null = keep Spanish (or per-verse) path
 */
export function resolveEnLiberDisplayText(activePrayer, mystery) {
  if (!activePrayer) return null;
  const en = resolveEnLiberFishText(activePrayer.id, mystery, '');
  if (en) return en;
  const byLang = pickVariantIdForLang(activePrayer.variants || [], 'en');
  if (byLang) {
    const v = activePrayer.variants.find((x) => x.id === byLang);
    if (v?.text) return v.text;
  }
  return null;
}

/** Glass + speakable: EN pack when selected, else variant/ES body. */
export function resolveLiberBodyText(activePrayer, variantId, voiceLang, mystery) {
  if (!activePrayer) return '';
  if (wantsEnglish(voiceLang)) {
    const en = resolveEnLiberDisplayText(activePrayer, mystery);
    if (en) return en;
  }
  return resolveDisplayText(activePrayer, variantId);
}

export function resolveLiberTitle(activePrayer, voiceLang, mystery) {
  if (!activePrayer) return '';
  if (wantsEnglish(voiceLang)) {
    const t = resolveEnGuideTitle(activePrayer.id, mystery);
    if (t) return t;
    if (activePrayer.id === 'DMO1') return 'You expired, Jesus';
    if (activePrayer.id === 'DMO2') return 'Blood and Water';
  }
  if (activePrayer.id === 'DMO1') return 'Expiraste, Jesús';
  if (activePrayer.id === 'DMO2') return 'Sangre y Agua';
  return cleanPrayerDisplayTitle(activePrayer.title);
}

/** Prefer Ajustes idioma (voiceLang); fall back to per-prayer ◇ save. */
export function loadSavedVariantId(activePrayer, voiceLang) {
  if (!activePrayer?.variants?.length) return null;
  const lang = voiceLang || getVoicePrefs().voiceLang || 'es';
  const byLang = pickVariantIdForLang(activePrayer.variants, lang);
  if (byLang && activePrayer.variants.some((v) => v.id === byLang)) return byLang;
  try {
    const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
    if (saved && activePrayer.variants.some((v) => v.id === saved)) return saved;
  } catch (_) { /* ignore */ }
  return activePrayer.variants[0].id;
}
