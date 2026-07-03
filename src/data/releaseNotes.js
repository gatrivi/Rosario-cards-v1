/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.47',
  name: 'Clasificar y subir imágenes',
  CURRENT: [
    'Estudio → pestaña Clasificar: categorías litúrgicas',
    'Arrastrar carpeta/archivos → Firebase Storage + biblioteca',
    'Imágenes subidas disponibles para asignar a versos',
    'Firebase renombres en shared/artConfig',
  ],
  UPCOMING: [
    'Publicar reglas Firestore + Storage (si permiso denegado)',
    'Textos e imágenes dedicadas por estación',
    'Voz automática durante el rezo',
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
