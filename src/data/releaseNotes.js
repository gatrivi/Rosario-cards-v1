/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.45',
  name: 'Novedades fáciles de encontrar',
  CURRENT: [
    'Novedades: tocá v0.3.x abajo a la izquierda, o Ajustes → Novedades',
    'Aviso de actualización con resumen de cambios (PWA)',
    'Estudio de imágenes: Ajustes (botón circular arriba derecha) → Estudio',
    'Vía Crucis / Vía Lucis, sync de arte, Firebase preparado',
  ],
  UPCOMING: [
    'Textos e imágenes dedicadas por estación',
    'Firebase activo cuando haya boilerplate',
    'Voz automática durante el rezo (grabaciones)',
    'Menú “Más devociones” si crecen los vitrales',
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
