/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.49',
  name: 'Ajustes desplazables',
  CURRENT: [
    'Ajustes se puede desplazar; Actualizar y Estudio arriba',
    'Voz automática y meditación por estación (Vía Crucis/Lucis)',
    'Estudio → Clasificar + asignar versos',
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
