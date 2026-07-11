/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.53',
  name: 'San Benito en breves',
  CURRENT: [
    'Oraciones breves: San Benito y Ángel de la Guarda en el estante Devociones',
    'Móvil: Devociones ya no queda tapado por el chip Ángel·Benito',
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
