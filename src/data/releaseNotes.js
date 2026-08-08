/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.73',
  name: 'Cola de devociones',
  CURRENT: [
    'Más ? Cola: playlist Liber AUTO (corta?larga)',
    'Repeticiones, orden y calor de reproducciones',
    'Liber EN Fish + fondos limpios (0.3.72)',
  ],
  UPCOMING: [
    'Clips Vía Crucis / Lucis EN restantes',
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
