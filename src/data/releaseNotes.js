/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.72',
  name: 'Fish EN + fondos limpios',
  CURRENT: [
    'Liber EN: Fish guide (117 clips) ? no Spanish under English',
    '? Fish-only por idioma; manuscritos fuera del vitral',
    'Estudio: asignar a varios + Texto-pesado',
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
