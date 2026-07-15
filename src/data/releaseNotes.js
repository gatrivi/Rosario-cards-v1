/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.62',
  name: 'Libro · Rosario · Más',
  CURRENT: [
    'Nav clara: Libro · Rosario · Más (Diario/Rosedal/Camino/Rosa/Voz)',
    'Misterios Gozosos… · Ajustes por secciones · Rezá por Argentina',
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
