/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.50',
  name: 'Estante de Devociones',
  CURRENT: [
    'Libro: devociones agrupadas en un panel "Devociones" (ya no tapan la oración)',
    'Devociones largas y oraciones breves separadas, con nombre bajo cada vitral',
    'Insignia de versión corregida en Rosario Virtual',
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
