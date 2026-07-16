/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.63',
  name: 'Compromiso en el Camino',
  CURRENT: [
    'Rezá por Argentina: modal dorado del app + progreso en el Camino',
    'Libro · Rosario · Más · compromiso = 5 décenas (Ya recé)',
  ],
  UPCOMING: [
    'Clips guía EN en /voice/en/',
    'Corazón Inmaculado / Escápulario como recorridos',
    'Confirmación al borrar una toma de voz',
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
