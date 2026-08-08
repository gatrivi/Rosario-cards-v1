/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.69',
  name: 'Devoción en vivo',
  CURRENT: [
    'Deploy: voz guía ES Fish en Magnificat / Ángelus / Sangre / Vías / Misericordia',
    'Liber: Idioma ES/EN/LA + chrome corto',
  ],
  UPCOMING: [
    'Clips guía EN Liber (Fish bake en curso)',
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
