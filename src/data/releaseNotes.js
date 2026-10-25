/**
 * Shipped vs upcoming ? keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes ? Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.89',
  name: 'La Anunciación',
  CURRENT: [
    'Cada verso del Ave María trae su escena: el saludo de Gabriel, la Visitación, el Niño, la Dolorosa, la Piedad y la gloria de María en el Amén',
    'Cada día el rosario sigue recorriendo las imágenes donde quedó ayer: más de 200 vitrales distintos en cinco días',
    'La Letanía de Loreto vuelve a mostrar la imagen elegida para cada una de sus 65 invocaciones',
    'Más vitrales y claroscuros: 233 imágenes marianas y 63 de la Pasión, revisadas una por una',
  ],
  UPCOMING: [
    'Elegir a mano la mejor imagen para cada verso (Gabriel, Isabel, la hora de la muerte)',
    'San José: esperando arte propio para entrar al estante',
    'Voces guía de las devociones nuevas (falta pasar el generador de voz)',
    'Revisar a mano los temas adivinados de la biblioteca (confianza baja)',
    'QR de peregrinación + prueba móvil/offline',
  ],
};

export function getReleaseNotes() {
  return RELEASE_NOTES;
}

/** Single version source — badge, update banner, telemetry and SW all read this. */
export const APP_VERSION = RELEASE_NOTES.version;

/** One-line summary for the update toast. */
export function getUpdateSummaryLine() {
  const { CURRENT } = RELEASE_NOTES;
  if (!CURRENT?.length) return 'Nueva versión lista.';
  return CURRENT.slice(0, 2).join(' · ');
}
