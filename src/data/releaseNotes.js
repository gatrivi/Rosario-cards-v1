/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.51',
  name: 'Voz guía · Preciosísima Sangre',
  CURRENT: [
    'Julio: voz guía Piper en 7 Ofrendas, Corona (contrición/invocación/cierre) y oración final de la Letanía',
    'Libro: botón ▶ junto al título reproduce la voz guía (o tu grabación si hay)',
    'Al avanzar de oración suena la voz si el sonido está activo',
  ],
  UPCOMING: [
    'Más versos de la Letanía de la Sangre + Padre/Gloria de la Corona',
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
