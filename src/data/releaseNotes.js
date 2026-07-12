/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.56',
  name: 'Devociones en barra inferior',
  CURRENT: [
    'Globos + Ayuda + Ajustes fijos arriba (one-hand ya no los baja)',
    'Devociones: icono en barra Libro → tooltip; ya no tapa el footer',
  ],
  UPCOMING: [
    'Versos de la Letanía de la Sangre (líder + respuestas)',
    'Publicar reglas Firestore + Storage (si permiso denegado)',
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
