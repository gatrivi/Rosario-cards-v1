import { getVariantStorageKey, pickVariantIdForLang } from '../data/prayerVariants';
import { getVoicePrefs } from './voicePrefs';

export function resolveDisplayText(activePrayer, variantId) {
  if (!activePrayer) return '';
  const variants = activePrayer.variants;
  if (variants?.length && variantId) {
    const chosen = variants.find((v) => v.id === variantId);
    if (chosen) return chosen.text;
  }
  return activePrayer.text || '';
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
