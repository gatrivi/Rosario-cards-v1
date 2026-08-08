/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.70',
  name: 'Guía que suena',
  CURRENT: [
    'Liber ?: play inicia en el toque (gesto) ? clips ES de devoción',
    'Ajustes ? Copiar errores (pegar en el chat)',
    'Tipografía de título/paso de devoción (Georgia small-caps)',
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
