/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.46',
  name: 'Firebase arte en la nube',
  CURRENT: [
    'Firebase conectado: renombres y asignaciones en shared/artConfig',
    'Estudio de imágenes: Subir / Bajar de nube (sin sync ID)',
    'Ajustes (engranaje arriba derecha) → Estudio de imágenes',
    'Novedades: tocá v0.3.x abajo a la izquierda',
  ],
  UPCOMING: [
    'Publicar reglas Firestore si hay permiso denegado',
    'Textos e imágenes dedicadas por estación',
    'Voz automática durante el rezo (grabaciones)',
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
