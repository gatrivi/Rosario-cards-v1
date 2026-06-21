import { getVariantStorageKey } from '../data/prayerVariants';

export function resolveDisplayText(activePrayer, variantId) {
  if (!activePrayer) return '';
  const variants = activePrayer.variants;
  if (variants?.length && variantId) {
    const chosen = variants.find((v) => v.id === variantId);
    if (chosen) return chosen.text;
  }
  return activePrayer.text || '';
}

export function loadSavedVariantId(activePrayer) {
  if (!activePrayer?.variants?.length) return null;
  try {
    const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
    if (saved && activePrayer.variants.some((v) => v.id === saved)) return saved;
  } catch (_) { /* ignore */ }
  return activePrayer.variants[0].id;
}
