/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.77',
  name: 'Coraza y décadas',
  CURRENT: [
    'San Patricio (Coraza) y San Cayetano en Oraciones breves',
    'Vía Crucis · Rosario: década de Ave Marías por estación',
    'Ángelus al frente (0.3.76)',
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
