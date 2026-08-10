/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.79',
  name: 'EN glass',
  CURRENT: [
    'Liber: idioma EN muestra texto EN (no ES + audio EN)',
    'Autorezo fiable (0.3.78)',
  ],
  UPCOMING: [
    'Revamp light/dark (imglight / imgmo)',
    'Letanía Loreto EN verse-by-verse',
  ],
};

export function getReleaseNotes() {
  return RELEASE_NOTES;
}

/** One-line summary for the update toast. */
export function getUpdateSummaryLine() {
  const { CURRENT } = RELEASE_NOTES;
  if (!CURRENT?.length) return 'Nueva versión lista.';
  return CURRENT.slice(0, 2).join(' · ');
}
