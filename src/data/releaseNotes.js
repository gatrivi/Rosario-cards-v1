/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.68',
  name: 'Liber chrome corto',
  CURRENT: [
    'Liber: Recorrido + Compartir en una sola fila (más espacio al texto)',
    'Ajustes → Idioma del Liber (ES / EN / LA): texto + audio',
    'Voz guía ES Fish (Voz 4) en las devociones del Liber',
  ],
  UPCOMING: [
    'Clips guía EN Liber (Fish bake en curso)',
    'Idioma en Liber sin romper UI',
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
