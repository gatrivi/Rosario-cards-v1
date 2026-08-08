/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.71',
  name: '▶ que suena de verdad',
  CURRENT: [
    'Liber ▶: guía ES real (EN vacío ya no apunta a HTML)',
    '▶ ignora mic/efectos — pack Fish primero',
    'Ajustes → Copiar errores',
  ],
  UPCOMING: [
    'Clips guía EN Liber (cuando se suban los wav)',
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