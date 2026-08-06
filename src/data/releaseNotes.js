/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.66',
  name: 'San Expedito · HODIE',
  CURRENT: [
    'Liber ▶ en zona del pulgar (arriba del nav) · voz independiente de efectos',
    'Liber ≫ auto: avanza tras TTS y encadena las 4 vías del rosario',
  ],
  UPCOMING: [
    'Clips guía EN en /voice/en/',
    'Corazón Inmaculado / Escápulario como recorridos',
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
