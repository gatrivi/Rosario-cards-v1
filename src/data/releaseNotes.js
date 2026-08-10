/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.78',
  name: 'Autorezo fiable',
  CURRENT: [
    'Autorezo (antes Cola): Empezar abre Liber con ? solo',
    'Corrige carrera: AUTO no se perdía al salir de /cola',
    'San Patricio / Cayetano / Vía Rosario (0.3.77)',
  ],
  UPCOMING: [
    'Revamp light/dark (imglight / imgmo)',
    'Unicidad global de fondos cuando haya más pares',
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
