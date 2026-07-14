/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.57',
  name: 'Voces Tier S / Tier 3',
  CURRENT: [
    'Voz: Tier S (tu grabación) + Tier 3 Piper (guía provisional)',
    'Ángelus + Magnificat con voz guía T3; Estudio /voz muestra faltantes y permite subir audio',
  ],
  UPCOMING: [
    'Más letanía Sangre (versos 10+) y rosario con guía T3',
    'Versos de la Letanía de la Sangre (líder + respuestas)',
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
