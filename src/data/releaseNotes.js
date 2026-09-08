/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.83',
  name: 'El Relicario',
  CURRENT: [
    'Nuevo Reliquario: reliquias que se abren con tus Ave Marías (menú Más)',
    'Rosa: rework de gestos, audio y reanudación de sesión',
    'Libro: barra compacta, controles al pie, devociones desde el estante',
    'Rosario: gestos y progresión de cuentas afinados',
  ],
  UPCOMING: [
    'QR de peregrinación + prueba móvil/offline',
    'Revamp light/dark (imglight / imgmo)',
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
