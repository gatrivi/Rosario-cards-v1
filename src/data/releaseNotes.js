/**
 * Shipped vs upcoming — keep short. Agents update this when bumping APP_VERSION.
 * Shown in update banner, version-badge tap, and Ajustes → Novedades.
 */

export const RELEASE_NOTES = {
  version: '0.3.58',
  name: 'Libro · Loreto + voz EN',
  CURRENT: [
    'Letanía de Loreto: nombre y secciones en español; TTS no lee títulos de oración',
    'Títulos de misterios sin códigos MG/MD/ML; guías Piper ES retiradas (prep. voz EN)',
  ],
  UPCOMING: [
    'Clips guía en inglés bajo /voice/en/',
    'Versos Letanía Sangre / Loreto con voz guía',
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
