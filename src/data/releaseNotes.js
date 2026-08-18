/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.81',
  name: 'Rosa drag contract',
  CURRENT: [
    'Rosa: mantener y arrastrar funciona igual con mouse y touch',
    'La rosa SVG crece con el progreso real de la oración',
    'PWA fuerza el bundle nuevo y purga el cache anterior',
  ],
  UPCOMING: [
    'QR de peregrinación + prueba móvil/offline',
    'Revamp light/dark (imglight / imgmo)',
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
