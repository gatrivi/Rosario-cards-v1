/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.74',
  name: 'Arte sin clones',
  CURRENT: [
    'Fondos únicos por familia (Carmen ? Ángelus; SCA/Vías sin repetir)',
    'Registro: arte Mary/nuns/monk + dump used/unused',
    'Fix: Liber ya no rota el fondo con el índice del paso',
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
