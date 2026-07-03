/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.48',
  name: 'Estaciones y voz propia',
  CURRENT: [
    'Vía Crucis / Lucis: meditación propia por estación',
    'Voz automática: si grabaste una oración, suena al llegar a ese paso',
    'Estudio → Clasificar + subir imágenes a la nube',
  ],
  UPCOMING: [
    'Publicar reglas Firestore + Storage (si permiso denegado)',
    'Imágenes dedicadas por estación',
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
