/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.74',
  name: 'Cola vitrales + AUTO',
  CURRENT: [
    'Más ? Cola: vitrales por devoción y fila activa',
    'Cola AUTO: ? sigue entre devociones sin cortar',
    'Cola de devociones Liber AUTO (0.3.73)',
  ],
  UPCOMING: [
    'Clips Vía Crucis / Lucis EN restantes',
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
