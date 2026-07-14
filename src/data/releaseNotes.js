/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.59',
  name: 'San Miguel + Próximas',
  CURRENT: [
    'Oración a San Miguel Arcángel (vitral) en Devociones → breves',
    'Fila Próximas: Inmaculado Corazón, Espíritu Santo, Escápulario… (B/N, deshabilitadas)',
  ],
  UPCOMING: [
    'Corazón Inmaculado / Escápulario / Memorare como recorridos',
    'Clips guía en inglés bajo /voice/en/',
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
