/**
 * Fixed liturgical tags for classifying art.
 * Images may have several; "unclassified" = none of these.
 */

export const LITURGICAL_CATEGORIES = [
  { id: 'passion', label: 'Pasión / Cruz', emoji: '✝' },
  { id: 'resurrection', label: 'Resurrección', emoji: '☀' },
  { id: 'mary', label: 'María', emoji: '🌹' },
  { id: 'divine-mercy', label: 'Divina Misericordia', emoji: '💧' },
  { id: 'eucharist', label: 'Eucaristía', emoji: '🍞' },
  { id: 'holy-spirit', label: 'Espíritu Santo', emoji: '🕊' },
  { id: 'saints', label: 'Santos', emoji: '✝' },
  { id: 'prayer-text', label: 'Texto de oración', emoji: '📜' },
  { id: 'stained-glass', label: 'Vitral', emoji: '🪟' },
  { id: 'nativity', label: 'Navidad / Gozo', emoji: '⭐' },
  { id: 'lent', label: 'Cuaresma', emoji: '🕯' },
  { id: 'generic', label: 'Genérico / otro', emoji: '🖼' },
];

const CATEGORY_IDS = new Set(LITURGICAL_CATEGORIES.map((c) => c.id));

export function isLiturgicalTag(tag) {
  return CATEGORY_IDS.has(tag);
}

export function hasLiturgicalCategory(tags = []) {
  return tags.some((t) => CATEGORY_IDS.has(t));
}

export function liturgicalTagsOf(tags = []) {
  return tags.filter((t) => CATEGORY_IDS.has(t));
}
