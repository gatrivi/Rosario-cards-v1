/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.52',
  name: 'Voz guía · Corona completa',
  CURRENT: [
    'Fix Vercel CI: DevotionsShelf hooks (build ya no falla con CI=true)',
    'Corona Sangre: voz en Cruz, Padre, Gloria, invocación, cierre; Letanía: 9 invocaciones iniciales',
    'Motor: IndexedDB (grabaciones) primero; si no hay, Piper en /voice/sangrepreciosa',
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
